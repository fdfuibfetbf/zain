import { Router } from 'express';
import { z } from 'zod';

import { requireAuth } from '../auth/authMiddleware.js';
import { createWhmcsApiClient } from '../whmcs/whmcsClientFactory.js';
import { prisma } from '../../prisma/client.js';
import { getKmsClientForKeyId } from '../crypto/kms/kmsFactory.js';
import { SecretService } from '../secrets/secretService.js';
import { createProviderAdapter } from '../providers/registry.js';
import { writeAuditLog } from '../audit/auditLogService.js';

const actionSchema = z.object({
  action: z.enum(['reboot', 'suspend', 'terminate', 'reinstall', 'power_on', 'power_off']),
});

function isDemoMode(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DEMO_MODE !== 'false';
}

// Demo data for testing without database/WHMCS
const DEMO_SERVICES = [
  {
    serviceId: 1001,
    productId: 1,
    name: 'VPS Basic - Demo Server',
    status: 'Active',
    server: {
      status: 'active',
      ip: '192.168.1.100',
      providerResourceId: 'demo-server-001',
    },
  },
  {
    serviceId: 1002,
    productId: 2,
    name: 'VPS Pro - Production',
    status: 'Active',
    server: {
      status: 'active',
      ip: '192.168.1.101',
      providerResourceId: 'demo-server-002',
    },
  },
  {
    serviceId: 1003,
    productId: 1,
    name: 'VPS Basic - Staging',
    status: 'Pending',
    server: null,
  },
];

export function buildPanelRouter() {
  const router = Router();

  router.get('/services', requireAuth(), async (req, res) => {
    // Demo mode - return mock data
    if (isDemoMode()) {
      return res.json({ services: DEMO_SERVICES });
    }

    const whmcs = await createWhmcsApiClient();
    const out = await whmcs.getClientsProducts({ clientId: req.auth!.whmcsUserId });
    if (out.result !== 'success') return res.status(502).json({ error: out.message ?? 'WHMCS error' });

    const products = out.products?.product ?? [];
    const serviceIds = products.map((p: any) => Number(p.id)).filter((n: number) => Number.isFinite(n));

    const servers = await prisma.serverInstance.findMany({
      where: { whmcsServiceId: { in: serviceIds } },
    });
    const serverByServiceId = new Map(servers.map((s) => [s.whmcsServiceId, s]));

    const enriched = products.map((p: any) => {
      const serviceId = Number(p.id);
      const server = serverByServiceId.get(serviceId);
      return {
        serviceId,
        productId: Number(p.pid ?? p.productid ?? p.product_id ?? 0),
        name: p.name ?? p.productname ?? p.domain ?? `Service ${serviceId}`,
        status: p.status,
        server: server
          ? {
              status: server.status,
              ip: server.ip,
              providerResourceId: server.providerResourceId,
            }
          : null,
      };
    });

    res.json({ services: enriched });
  });

  router.post('/services/:serviceId/actions', requireAuth(), async (req, res) => {
    const parsed = actionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });

    const whmcsServiceId = Number(req.params.serviceId);
    if (!Number.isFinite(whmcsServiceId)) return res.status(400).json({ error: 'Invalid serviceId' });

    // Demo mode - simulate action
    if (isDemoMode()) {
      const demoService = DEMO_SERVICES.find(s => s.serviceId === whmcsServiceId);
      if (!demoService) return res.status(404).json({ error: 'Service not found' });
      if (!demoService.server) return res.status(409).json({ error: 'Server not provisioned yet' });
      
      // Simulate a small delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return res.json({ ok: true, message: `Demo: ${parsed.data.action} action simulated` });
    }

    // Ownership: confirm service exists for this user via WHMCS.
    const whmcs = await createWhmcsApiClient();
    const productsOut = await whmcs.getClientsProducts({ clientId: req.auth!.whmcsUserId });
    if (productsOut.result !== 'success') return res.status(502).json({ error: productsOut.message ?? 'WHMCS error' });

    const products = productsOut.products?.product ?? [];
    const svc = products.find((p: any) => Number(p.id) === whmcsServiceId);
    if (!svc) return res.status(404).json({ error: 'Service not found' });

    const server = await prisma.serverInstance.findUnique({ where: { whmcsServiceId } });
    if (!server) return res.status(409).json({ error: 'Server not provisioned yet' });

    const whmcsProductId = Number(svc.pid ?? svc.productid ?? svc.product_id ?? 0);
    const mapping = await prisma.productMapping.findUnique({ where: { whmcsProductId } });
    if (!mapping) return res.status(409).json({ error: 'No product mapping for this service product' });

    const provider = await prisma.provider.findUnique({ where: { id: mapping.providerId } });
    const credential = await prisma.providerCredential.findUnique({ where: { id: mapping.credentialId } });
    if (!provider || !credential) return res.status(409).json({ error: 'Provider/credential missing' });

    const secretRow = await prisma.secret.findUnique({ where: { id: credential.secretId } });
    if (!secretRow) return res.status(500).json({ error: 'Credential secret missing' });

    const kms = await getKmsClientForKeyId(secretRow.kmsKeyId);
    const secrets = new SecretService(kms);
    const credentialPlaintext = await secrets.decryptSecretValue({ secretId: secretRow.id });

    const adapter = createProviderAdapter({ type: provider.type, credentialPlaintext });

    const idempotencyKey =
      (typeof req.header('Idempotency-Key') === 'string' && req.header('Idempotency-Key')) ||
      `user:${req.auth!.whmcsUserId}:${whmcsServiceId}:${parsed.data.action}:${Date.now()}`;

    const actionReq = await prisma.actionRequest.create({
      data: {
        whmcsUserId: req.auth!.whmcsUserId,
        whmcsServiceId,
        action: parsed.data.action,
        status: 'running',
        idempotencyKey,
        startedAt: new Date(),
      },
    });

    const op = async () => {
      switch (parsed.data.action) {
        case 'reboot':
          return adapter.rebootServer(server.providerResourceId);
        case 'suspend':
          return adapter.suspendServer(server.providerResourceId);
        case 'terminate':
          return adapter.terminateServer(server.providerResourceId);
        case 'reinstall':
          return adapter.reinstallServer(server.providerResourceId, mapping.planRef as any);
        case 'power_on':
          return adapter.powerOn(server.providerResourceId);
        case 'power_off':
          return adapter.powerOff(server.providerResourceId);
      }
    };

    const result = await op();

    if (!result.ok) {
      await prisma.actionRequest.update({
        where: { id: actionReq.id },
        data: { status: 'failed', completedAt: new Date(), error: result.error },
      });
      await writeAuditLog({
        actorType: req.auth!.role,
        actorWhmcsId: req.auth!.whmcsUserId,
        action: `server.${parsed.data.action}.failed`,
        targetType: 'ServerInstance',
        targetId: server.id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: { error: result.error },
      });
      return res.status(502).json({ error: result.error });
    }

    await prisma.actionRequest.update({
      where: { id: actionReq.id },
      data: { status: 'succeeded', completedAt: new Date() },
    });

    await writeAuditLog({
      actorType: req.auth!.role,
      actorWhmcsId: req.auth!.whmcsUserId,
      action: `server.${parsed.data.action}`,
      targetType: 'ServerInstance',
      targetId: server.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true });
  });

  router.get('/services/:serviceId', requireAuth(), async (req, res) => {
    try {
      const whmcsServiceId = Number(req.params.serviceId);
      if (!Number.isFinite(whmcsServiceId)) return res.status(400).json({ error: 'Invalid serviceId' });

      // Demo mode - return mock data
      if (isDemoMode()) {
        const demoService = DEMO_SERVICES.find(s => s.serviceId === whmcsServiceId);
        if (!demoService) return res.status(404).json({ error: 'Service not found' });

        return res.json({
          service: {
            serviceId: demoService.serviceId,
            productId: demoService.productId,
            name: demoService.name,
            status: demoService.status,
            domain: 'demo.example.com',
            amount: '29.99',
            currency: 'USD',
            nextduedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          server: demoService.server ? {
            id: 'demo-' + demoService.serviceId,
            status: demoService.server.status,
            ip: demoService.server.ip,
            region: 'us-east-1',
            providerResourceId: demoService.server.providerResourceId,
            provider: 'Demo Provider',
            providerType: 'digitalocean',
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } : null,
          actions: [],
        });
      }

      const whmcs = await createWhmcsApiClient();
      const productsOut = await whmcs.getClientsProducts({ clientId: req.auth!.whmcsUserId });
      if (productsOut.result !== 'success') return res.status(502).json({ error: productsOut.message ?? 'WHMCS error' });

      const products = productsOut.products?.product ?? [];
      const svc = products.find((p: any) => Number(p.id) === whmcsServiceId);
      if (!svc) return res.status(404).json({ error: 'Service not found' });

      const server = await prisma.serverInstance.findUnique({
        where: { whmcsServiceId },
        include: {
          provider: true,
          actions: {
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
        },
      });

      res.json({
        service: {
          serviceId: whmcsServiceId,
          productId: Number(svc.pid ?? svc.productid ?? svc.product_id ?? 0),
          name: svc.name ?? svc.productname ?? svc.domain ?? `Service ${whmcsServiceId}`,
          status: svc.status,
          domain: svc.domain,
          amount: svc.amount,
          currency: svc.currency,
          nextduedate: svc.nextduedate,
        },
        server: server
          ? {
              id: server.id,
              status: server.status,
              ip: server.ip,
              region: server.region,
              providerResourceId: server.providerResourceId,
              provider: server.provider.displayName,
              providerType: server.provider.type,
              metadata: server.metadata,
              createdAt: server.createdAt.toISOString(),
              updatedAt: server.updatedAt.toISOString(),
            }
          : null,
        actions: server?.actions.map((a) => ({
          id: a.id,
          action: a.action,
          status: a.status,
          requestedAt: a.requestedAt.toISOString(),
          startedAt: a.startedAt?.toISOString(),
          completedAt: a.completedAt?.toISOString(),
          error: a.error,
        })) ?? [],
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch service details' });
    }
  });

  router.get('/services/:serviceId/actions', requireAuth(), async (req, res) => {
    try {
      const whmcsServiceId = Number(req.params.serviceId);
      if (!Number.isFinite(whmcsServiceId)) return res.status(400).json({ error: 'Invalid serviceId' });

      // Demo mode - return mock actions
      if (isDemoMode()) {
        const demoService = DEMO_SERVICES.find(s => s.serviceId === whmcsServiceId);
        if (!demoService) return res.status(404).json({ error: 'Service not found' });
        
        return res.json({ actions: [] });
      }

      const whmcs = await createWhmcsApiClient();
      const productsOut = await whmcs.getClientsProducts({ clientId: req.auth!.whmcsUserId });
      if (productsOut.result !== 'success') return res.status(502).json({ error: productsOut.message ?? 'WHMCS error' });

      const products = productsOut.products?.product ?? [];
      const svc = products.find((p: any) => Number(p.id) === whmcsServiceId);
      if (!svc) return res.status(404).json({ error: 'Service not found' });

      const limit = Math.min(Number(req.query.limit ?? 50), 200);
      const actions = await prisma.actionRequest.findMany({
        where: { whmcsServiceId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      res.json({
        actions: actions.map((a) => ({
          id: a.id,
          action: a.action,
          status: a.status,
          requestedAt: a.requestedAt.toISOString(),
          startedAt: a.startedAt?.toISOString(),
          completedAt: a.completedAt?.toISOString(),
          error: a.error,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch actions' });
    }
  });

  return router;
}


