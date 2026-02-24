import { Router } from 'express';
import { z } from 'zod';

import { requireAuth } from '../auth/authMiddleware.js';
import { writeAuditLog } from '../audit/auditLogService.js';

const actionSchema = z.object({
  action: z.enum(['reboot', 'suspend', 'terminate', 'reinstall', 'power_on', 'power_off']),
});

// Demo data for testing
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
    return res.json({ services: DEMO_SERVICES });
  });

  router.post('/services/:serviceId/actions', requireAuth(), async (req, res) => {
    const parsed = actionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });

    const serviceId = Number(req.params.serviceId);
    if (!Number.isFinite(serviceId)) return res.status(400).json({ error: 'Invalid serviceId' });

    const demoService = DEMO_SERVICES.find(s => s.serviceId === serviceId);
    if (!demoService) return res.status(404).json({ error: 'Service not found' });
    if (!demoService.server) return res.status(409).json({ error: 'Server not provisioned yet' });

    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 500));

    await writeAuditLog({
      actorType: req.auth!.role,
      actorWhmcsId: req.auth!.whmcsUserId,
      action: `server.${parsed.data.action}.simulated`,
      targetType: 'DemoServer',
      targetId: demoService.server.providerResourceId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.json({ ok: true, message: `Demo: ${parsed.data.action} action simulated` });
  });

  router.get('/services/:serviceId', requireAuth(), async (req, res) => {
    const serviceId = Number(req.params.serviceId);
    if (!Number.isFinite(serviceId)) return res.status(400).json({ error: 'Invalid serviceId' });

    const demoService = DEMO_SERVICES.find(s => s.serviceId === serviceId);
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
  });

  router.get('/services/:serviceId/actions', requireAuth(), async (req, res) => {
    return res.json({ actions: [] });
  });

  return router;
}
