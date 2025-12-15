import { prisma } from '../../prisma/client.js';
import { createProviderAdapter } from '../providers/registry.js';
import { getKmsClientForKeyId } from '../crypto/kms/kmsFactory.js';
import { SecretService } from '../secrets/secretService.js';
import { writeAuditLog } from '../audit/auditLogService.js';
import { WhmcsApiClient } from '../whmcs/whmcsApiClient.js';
import { createWhmcsApiClient } from '../whmcs/whmcsClientFactory.js';

function extractServiceAndProduct(payload: any): { whmcsServiceId: number; whmcsProductId: number } | null {
  const serviceId =
    payload?.serviceid ??
    payload?.service_id ??
    payload?.data?.serviceid ??
    payload?.data?.service_id ??
    payload?.data?.service?.id;
  const productId =
    payload?.productid ??
    payload?.product_id ??
    payload?.data?.productid ??
    payload?.data?.product_id ??
    payload?.data?.service?.product_id ??
    payload?.data?.service?.pid;

  const whmcsServiceId = Number(serviceId);
  const whmcsProductId = Number(productId);
  if (!Number.isFinite(whmcsServiceId) || !Number.isFinite(whmcsProductId)) return null;
  return { whmcsServiceId, whmcsProductId };
}

async function getWhmcsApiClient(): Promise<WhmcsApiClient> {
  return createWhmcsApiClient();
}

export async function processWhmcsWebhookDelivery(deliveryId: string) {
  const delivery = await prisma.webhookDelivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) throw new Error('WebhookDelivery not found');

  // Idempotency: if already processed with a result that indicates done, skip.
  if (delivery.processedAt) return;

  const payload = delivery.payload as any;
  const extracted = extractServiceAndProduct(payload);
  if (!extracted) {
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: { processedAt: new Date(), result: { ok: false, error: 'Missing service/product IDs' } as any },
    });
    return;
  }

  // Idempotency: avoid double provisioning for same WHMCS service id.
  const existingServer = await prisma.serverInstance.findUnique({
    where: { whmcsServiceId: extracted.whmcsServiceId },
  });
  if (existingServer) {
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: { processedAt: new Date(), result: { ok: true, skipped: 'server_exists' } as any },
    });
    return;
  }

  const mapping = await prisma.productMapping.findUnique({
    where: { whmcsProductId: extracted.whmcsProductId },
  });
  if (!mapping) {
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: { processedAt: new Date(), result: { ok: false, error: 'No product mapping' } as any },
    });
    return;
  }

  const provider = await prisma.provider.findUnique({ where: { id: mapping.providerId } });
  const credential = await prisma.providerCredential.findUnique({ where: { id: mapping.credentialId } });
  if (!provider || !credential) {
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: { processedAt: new Date(), result: { ok: false, error: 'Provider/credential missing' } as any },
    });
    return;
  }

  const secretRow = await prisma.secret.findUnique({ where: { id: credential.secretId } });
  if (!secretRow) throw new Error('Provider secret missing');

  const kms = await getKmsClientForKeyId(secretRow.kmsKeyId);
  const secrets = new SecretService(kms);
  const credentialPlaintext = await secrets.decryptSecretValue({ secretId: secretRow.id });

  const adapter = createProviderAdapter({ type: provider.type, credentialPlaintext });

  await prisma.actionRequest.create({
    data: {
      whmcsUserId: 0,
      whmcsServiceId: extracted.whmcsServiceId,
      action: 'create',
      status: 'running',
      idempotencyKey: `webhook:${delivery.id}:create`,
      startedAt: new Date(),
    },
  });

  const createRes = await adapter.createServer({
    name: `svc-${extracted.whmcsServiceId}`,
    planRef: mapping.planRef as any,
  });

  if (!createRes.ok) {
    await prisma.actionRequest.updateMany({
      where: { idempotencyKey: `webhook:${delivery.id}:create` },
      data: { status: 'failed', completedAt: new Date(), error: createRes.error },
    });
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: { processedAt: new Date(), result: { ok: false, error: createRes.error } as any },
    });
    return;
  }

  const server = await prisma.serverInstance.create({
    data: {
      whmcsServiceId: extracted.whmcsServiceId,
      providerId: provider.id,
      providerResourceId: createRes.value.providerResourceId,
      status: 'provisioning',
      ip: createRes.value.ip ?? null,
      metadata: createRes.value.raw ?? {},
    },
  });

  await prisma.actionRequest.updateMany({
    where: { idempotencyKey: `webhook:${delivery.id}:create` },
    data: { status: 'succeeded', completedAt: new Date() },
  });

  // Sync back to WHMCS (minimal: dedicated IP if present). Extend later with custom fields and credentials.
  try {
    if (createRes.value.ip) {
      const whmcs = await getWhmcsApiClient();
      await whmcs.updateClientProductDedicatedIp({ serviceId: extracted.whmcsServiceId, ip: createRes.value.ip });
    }
  } catch (e) {
    await writeAuditLog({
      actorType: 'system',
      action: 'whmcs.sync_failed',
      targetType: 'ServerInstance',
      targetId: server.id,
      details: { error: e instanceof Error ? e.message : String(e) },
    });
  }

  await prisma.webhookDelivery.update({
    where: { id: delivery.id },
    data: { processedAt: new Date(), result: { ok: true, serverId: server.id } as any },
  });

  await writeAuditLog({
    actorType: 'system',
    action: 'provisioning.created',
    targetType: 'ServerInstance',
    targetId: server.id,
    details: {
      whmcsServiceId: extracted.whmcsServiceId,
      whmcsProductId: extracted.whmcsProductId,
      providerType: provider.type,
      providerResourceId: server.providerResourceId,
    },
  });
}


