import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

import { Router } from 'express';

import { prisma } from '../../../prisma/client.js';
import { getKmsClientForKeyId } from '../../crypto/kms/kmsFactory.js';
import { SecretService } from '../../secrets/secretService.js';
import { writeAuditLog } from '../../audit/auditLogService.js';
import { processWhmcsWebhookDelivery } from '../../provisioning/whmcsWebhookProcessor.js';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

async function loadWebhookSecret(): Promise<string | null> {
  const row = await prisma.secret.findFirst({
    where: { scope: 'app', name: 'whmcs_webhook_secret', isActive: true },
    orderBy: { version: 'desc' },
  });
  if (!row) return null;
  const kms = await getKmsClientForKeyId(row.kmsKeyId);
  const secrets = new SecretService(kms);
  return secrets.decryptSecretValue({ secretId: row.id });
}

function computeSignatureBase64(secret: string, rawBody: Buffer): string {
  return createHmac('sha256', secret).update(rawBody).digest('base64');
}

export function buildWhmcsWebhookRouter() {
  const router = Router();

  // WHMCS webhooks require raw body for signature validation.
  router.post('/', async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
    const signatureHeader =
      (req.header('X-WHMCS-Signature') ??
        req.header('WHMCS-Signature') ??
        req.header('X-Whmcs-Signature') ??
        '') as string;

    const secret = await loadWebhookSecret();

    let verified = false;
    if (secret && signatureHeader) {
      const computed = computeSignatureBase64(secret, rawBody);
      verified = safeEqual(computed, signatureHeader);
    }

    if (!verified && process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const dedupeHash = createHash('sha256').update(rawBody).digest('hex');

    let payload: any = null;
    try {
      payload = rawBody.length ? JSON.parse(rawBody.toString('utf8')) : null;
    } catch {
      payload = { raw: rawBody.toString('utf8') };
    }

    const event = (payload?.event ?? payload?.Event ?? payload?.type ?? 'unknown') as string;

    let delivery;
    try {
      delivery = await prisma.webhookDelivery.create({
        data: {
          event,
          dedupeHash,
          headers: req.headers as any,
          payload: payload as any,
          verified,
        },
      });
    } catch (e) {
      // Replay protection: same payload hash already exists.
      await writeAuditLog({
        actorType: 'system',
        action: 'whmcs_webhook.replay_blocked',
        targetType: 'WebhookDelivery',
        details: { event },
      });
      return res.json({ ok: true, skipped: 'duplicate' });
    }

    // Process synchronously for now (can be moved to a background queue later).
    await processWhmcsWebhookDelivery(delivery.id);

    await writeAuditLog({
      actorType: 'system',
      action: 'whmcs_webhook.received',
      targetType: 'WebhookDelivery',
      targetId: delivery.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { verified, event },
    });

    return res.json({ ok: true });
  });

  return router;
}


