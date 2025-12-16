import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

import { prisma } from '../../prisma/client.js';
import { requireAuth, requireRole } from '../auth/authMiddleware.js';
import { getKmsClientForKeyId } from '../crypto/kms/kmsFactory.js';
import { SecretService } from '../secrets/secretService.js';
import { writeAuditLog } from '../audit/auditLogService.js';
import { createWhmcsApiClient } from '../whmcs/whmcsClientFactory.js';

function isDemoMode(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DEMO_MODE !== 'false';
}

// Demo data for admin panel
const DEMO_STATS = {
  totalOrders: 156,
  totalClients: 89,
  totalServices: 234,
  totalInvoices: 312,
};

const DEMO_CLIENTS = [
  { id: '1', firstname: 'John', lastname: 'Doe', email: 'john@example.com', companyname: 'Acme Inc', status: 'Active', datecreated: '2024-01-15' },
  { id: '2', firstname: 'Jane', lastname: 'Smith', email: 'jane@example.com', companyname: '', status: 'Active', datecreated: '2024-02-20' },
  { id: '3', firstname: 'Bob', lastname: 'Wilson', email: 'bob@example.com', companyname: 'Tech Corp', status: 'Inactive', datecreated: '2024-03-10' },
];

const DEMO_ORDERS = [
  { id: '1', ordernum: '1001', userid: '1', date: '2024-06-01', status: 'Active', amount: '29.99', currency: 'USD', client: DEMO_CLIENTS[0] },
  { id: '2', ordernum: '1002', userid: '2', date: '2024-06-15', status: 'Pending', amount: '49.99', currency: 'USD', client: DEMO_CLIENTS[1] },
  { id: '3', ordernum: '1003', userid: '1', date: '2024-07-01', status: 'Active', amount: '99.99', currency: 'USD', client: DEMO_CLIENTS[0] },
];

const DEMO_SERVICES = [
  { id: '1', userid: '1', product: 'VPS Basic', domain: 'demo1.example.com', status: 'Active', amount: '29.99', currency: 'USD', nextduedate: '2024-08-01', server: { status: 'active', ip: '192.168.1.100', providerResourceId: 'demo-001' } },
  { id: '2', userid: '2', product: 'VPS Pro', domain: 'demo2.example.com', status: 'Active', amount: '49.99', currency: 'USD', nextduedate: '2024-08-15', server: { status: 'active', ip: '192.168.1.101', providerResourceId: 'demo-002' } },
  { id: '3', userid: '1', product: 'VPS Enterprise', domain: 'demo3.example.com', status: 'Suspended', amount: '99.99', currency: 'USD', nextduedate: '2024-07-01', server: null },
];

const DEMO_INVOICES = [
  { id: '1', userid: '1', invoicenum: 'INV-001', date: '2024-06-01', duedate: '2024-06-15', total: '29.99', status: 'Paid', paymentmethod: 'paypal' },
  { id: '2', userid: '2', invoicenum: 'INV-002', date: '2024-06-15', duedate: '2024-06-30', total: '49.99', status: 'Unpaid', paymentmethod: 'stripe' },
  { id: '3', userid: '1', invoicenum: 'INV-003', date: '2024-07-01', duedate: '2024-07-15', total: '99.99', status: 'Paid', paymentmethod: 'paypal' },
];

const kmsKeySchema = z.object({
  provider: z.enum(['aws', 'gcp', 'azure']),
  keyId: z.string().min(1),
  region: z.string().min(1).optional(),
  purpose: z.string().min(1).default('envelope'),
});

const whmcsConnectSchema = z.object({
  baseUrl: z.string().url(),
  apiIdentifier: z.string().min(1),
  apiSecret: z.string().min(1),
  kmsKeyId: z.string().uuid(),
});

const jwtKeySchema = z.object({
  jwtSigningKey: z.string().min(16),
  kmsKeyId: z.string().uuid(),
});

const whmcsWebhookSecretSchema = z.object({
  webhookSecret: z.string().min(16),
  kmsKeyId: z.string().uuid(),
});

const appConfigSchema = z.object({
  adminClientGroupId: z.number().int().positive().nullable(),
});

const providerSchema = z.object({
  type: z.enum(['hetzner', 'contabo', 'datawagon', 'digitalocean', 'vultr', 'linode']),
  displayName: z.string().min(1),
  enabled: z.boolean().default(true),
});

const providerCredentialSchema = z.object({
  label: z.string().min(1),
  secretValue: z.string().min(1),
  kmsKeyId: z.string().uuid(),
});

const productMappingSchema = z.object({
  whmcsProductId: z.number().int().positive(),
  providerId: z.string().uuid(),
  credentialId: z.string().uuid(),
  planRef: z.record(z.string(), z.unknown()),
});

function isLoopbackIp(ip?: string): boolean {
  if (!ip) return false;
  return ip === '127.0.0.1' || ip === '::1' || ip.endsWith('::1');
}

async function allowBootstrap(reqIp?: string): Promise<boolean> {
  const cfg = await prisma.appConfig.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton' },
    update: {},
  });
  return cfg.adminClientGroupId == null && isLoopbackIp(reqIp);
}

export function buildAdminRouter() {
  const router = Router();

  // Read-only helpers
  router.get('/kms-keys', requireAuth(), requireRole('admin'), async (_req, res) => {
    const keys = await prisma.kmsKey.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ keys });
  });

  router.post('/kms-keys', requireAuth(), async (req, res) => {
    const canBootstrap = await allowBootstrap(req.ip);
    if (!canBootstrap) return res.status(403).json({ error: 'Forbidden' });

    const parsed = kmsKeySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });

    const key = await prisma.kmsKey.create({
      data: {
        provider: parsed.data.provider,
        keyId: parsed.data.keyId,
        region: parsed.data.region,
        purpose: parsed.data.purpose,
      },
    });

    await writeAuditLog({
      actorType: 'system',
      action: 'kms_key.create',
      targetType: 'KmsKey',
      targetId: key.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ key });
  });

  router.get('/app-config', requireAuth(), async (_req, res) => {
    const cfg = await prisma.appConfig.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton' },
      update: {},
    });
    res.json({ config: cfg });
  });

  router.put('/app-config', requireAuth(), async (req, res) => {
    const canBootstrap = await allowBootstrap(req.ip);
    if (!canBootstrap) return res.status(403).json({ error: 'Forbidden' });

    const parsed = appConfigSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });

    const cfg = await prisma.appConfig.update({
      where: { id: 'singleton' },
      data: { adminClientGroupId: parsed.data.adminClientGroupId },
    });

    await writeAuditLog({
      actorType: 'system',
      action: 'app_config.update',
      targetType: 'AppConfig',
      targetId: 'singleton',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { adminClientGroupId: cfg.adminClientGroupId },
    });

    res.json({ config: cfg });
  });

  router.put('/jwt-signing-key', requireAuth(), async (req, res) => {
    const canBootstrap = await allowBootstrap(req.ip);
    if (!canBootstrap) return res.status(403).json({ error: 'Forbidden' });

    const parsed = jwtKeySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });

    const kms = await getKmsClientForKeyId(parsed.data.kmsKeyId);
    const secrets = new SecretService(kms);

    const current = await prisma.secret.findFirst({
      where: { scope: 'app', name: 'jwt_signing_key', isActive: true },
      orderBy: { version: 'desc' },
      select: { id: true },
    });

    const saved = current
      ? await secrets.rotateSecret({
          secretId: current.id,
          plaintext: parsed.data.jwtSigningKey,
          kmsKeyId: parsed.data.kmsKeyId,
          aad: { purpose: 'jwt' },
        })
      : await secrets.createSecret({
          scope: 'app',
          name: 'jwt_signing_key',
          plaintext: parsed.data.jwtSigningKey,
          kmsKeyId: parsed.data.kmsKeyId,
          aad: { purpose: 'jwt' },
        });

    await writeAuditLog({
      actorType: 'system',
      action: 'jwt_key.set',
      targetType: 'Secret',
      targetId: saved.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, secretId: saved.id, version: saved.version });
  });

  router.put('/whmcs-webhook-secret', requireAuth(), async (req, res) => {
    // Allow bootstrap from loopback until admin group is set; after that, admin-only.
    const canBootstrap = await allowBootstrap(req.ip);
    if (!canBootstrap) {
      // If not bootstrapping, require admin role explicitly.
      if (req.auth?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    }

    const parsed = whmcsWebhookSecretSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });

    const kms = await getKmsClientForKeyId(parsed.data.kmsKeyId);
    const secrets = new SecretService(kms);

    const current = await prisma.secret.findFirst({
      where: { scope: 'app', name: 'whmcs_webhook_secret', isActive: true },
      orderBy: { version: 'desc' },
      select: { id: true },
    });

    const saved = current
      ? await secrets.rotateSecret({
          secretId: current.id,
          plaintext: parsed.data.webhookSecret,
          kmsKeyId: parsed.data.kmsKeyId,
          aad: { purpose: 'whmcs_webhook' },
        })
      : await secrets.createSecret({
          scope: 'app',
          name: 'whmcs_webhook_secret',
          plaintext: parsed.data.webhookSecret,
          kmsKeyId: parsed.data.kmsKeyId,
          aad: { purpose: 'whmcs_webhook' },
        });

    await writeAuditLog({
      actorType: canBootstrap ? 'system' : 'admin',
      actorWhmcsId: canBootstrap ? null : (req.auth?.whmcsUserId ?? null),
      action: 'whmcs_webhook_secret.set',
      targetType: 'Secret',
      targetId: saved.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, secretId: saved.id, version: saved.version });
  });

  router.get('/whmcs', requireAuth(), async (_req, res) => {
    const conn = await prisma.whmcsConnection.findFirst({ orderBy: { createdAt: 'desc' } });
    res.json({ connection: conn });
  });

  router.put('/whmcs', requireAuth(), async (req, res) => {
    const canBootstrap = await allowBootstrap(req.ip);
    if (!canBootstrap) return res.status(403).json({ error: 'Forbidden' });

    const parsed = whmcsConnectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });

    const kms = await getKmsClientForKeyId(parsed.data.kmsKeyId);
    const secrets = new SecretService(kms);

    const existing = await prisma.whmcsConnection.findFirst({ orderBy: { createdAt: 'desc' } });
    let apiSecretId: string;

    if (existing?.apiSecretSecretId) {
      const rotated = await secrets.rotateSecret({
        secretId: existing.apiSecretSecretId,
        plaintext: parsed.data.apiSecret,
        kmsKeyId: parsed.data.kmsKeyId,
        aad: { purpose: 'whmcs_api' },
      });
      apiSecretId = rotated.id;
    } else {
      const created = await secrets.createSecret({
        scope: 'whmcs',
        name: 'whmcs_api_secret',
        plaintext: parsed.data.apiSecret,
        kmsKeyId: parsed.data.kmsKeyId,
        aad: { purpose: 'whmcs_api' },
      });
      apiSecretId = created.id;
    }

    const conn = existing
      ? await prisma.whmcsConnection.update({
          where: { id: existing.id },
          data: {
            baseUrl: parsed.data.baseUrl,
            apiIdentifier: parsed.data.apiIdentifier,
            apiSecretSecretId: apiSecretId,
            status: 'connected',
          },
        })
      : await prisma.whmcsConnection.create({
          data: {
            baseUrl: parsed.data.baseUrl,
            apiIdentifier: parsed.data.apiIdentifier,
            apiSecretSecretId: apiSecretId,
            status: 'connected',
          },
        });

    await writeAuditLog({
      actorType: 'system',
      action: 'whmcs.connect',
      targetType: 'WhmcsConnection',
      targetId: conn.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { baseUrl: conn.baseUrl },
    });

    res.json({ connection: conn });
  });

  // Providers
  router.get('/providers', requireAuth(), requireRole('admin'), async (_req, res) => {
    const providers = await prisma.provider.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ providers });
  });

  router.post('/providers', requireAuth(), requireRole('admin'), async (req, res) => {
    const parsed = providerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });

    const provider = await prisma.provider.create({ data: parsed.data });
    await writeAuditLog({
      actorType: 'admin',
      actorWhmcsId: req.auth?.whmcsUserId ?? null,
      action: 'provider.create',
      targetType: 'Provider',
      targetId: provider.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { type: provider.type },
    });
    res.json({ provider });
  });

  router.post('/providers/:providerId/credentials', requireAuth(), requireRole('admin'), async (req, res) => {
    const parsed = providerCredentialSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });

    const provider = await prisma.provider.findUnique({ where: { id: req.params.providerId } });
    if (!provider) return res.status(404).json({ error: 'Provider not found' });

    const kms = await getKmsClientForKeyId(parsed.data.kmsKeyId);
    const secrets = new SecretService(kms);
    const secret = await secrets.createSecret({
      scope: 'provider',
      name: `provider:${provider.type}:${parsed.data.label}`,
      plaintext: parsed.data.secretValue,
      kmsKeyId: parsed.data.kmsKeyId,
      aad: { providerType: provider.type, label: parsed.data.label },
    });

    const credential = await prisma.providerCredential.create({
      data: {
        providerId: provider.id,
        label: parsed.data.label,
        secretId: secret.id,
        createdByWhmcsUserId: req.auth?.whmcsUserId ?? null,
      },
    });

    await writeAuditLog({
      actorType: 'admin',
      actorWhmcsId: req.auth?.whmcsUserId ?? null,
      action: 'provider_credential.create',
      targetType: 'ProviderCredential',
      targetId: credential.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { providerId: provider.id, label: credential.label },
    });

    res.json({ credentialId: credential.id });
  });

  // Product mappings
  router.get('/product-mappings', requireAuth(), requireRole('admin'), async (_req, res) => {
    const mappings = await prisma.productMapping.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ mappings });
  });

  router.post('/product-mappings', requireAuth(), requireRole('admin'), async (req, res) => {
    const parsed = productMappingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });

    const mapping = await prisma.productMapping.upsert({
      where: { whmcsProductId: parsed.data.whmcsProductId },
      create: {
        whmcsProductId: parsed.data.whmcsProductId,
        providerId: parsed.data.providerId,
        credentialId: parsed.data.credentialId,
        planRef: parsed.data.planRef as Prisma.InputJsonValue,
      },
      update: {
        providerId: parsed.data.providerId,
        credentialId: parsed.data.credentialId,
        planRef: parsed.data.planRef as Prisma.InputJsonValue,
      },
    });

    await writeAuditLog({
      actorType: 'admin',
      actorWhmcsId: req.auth?.whmcsUserId ?? null,
      action: 'product_mapping.upsert',
      targetType: 'ProductMapping',
      targetId: mapping.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { whmcsProductId: mapping.whmcsProductId, providerId: mapping.providerId },
    });

    res.json({ mapping });
  });

  // Logs
  router.get('/audit-logs', requireAuth(), requireRole('admin'), async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 50), 200);
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
    res.json({ logs });
  });

  router.get('/webhook-deliveries', requireAuth(), requireRole('admin'), async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 50), 200);
    const deliveries = await prisma.webhookDelivery.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
    res.json({ deliveries });
  });

  // WHMCS Data Endpoints
  router.get('/whmcs/orders', requireAuth(), requireRole('admin'), async (req, res) => {
    // Demo mode
    if (isDemoMode()) {
      return res.json({ orders: DEMO_ORDERS, totalresults: DEMO_ORDERS.length, limitstart: 0, limitnum: 50 });
    }

    try {
      const whmcs = await createWhmcsApiClient();
      const limitstart = Number(req.query.limitstart ?? 0);
      const limitnum = Math.min(Number(req.query.limitnum ?? 50), 200);
      const status = req.query.status as string | undefined;

      const result = await whmcs.getOrders({ limitstart, limitnum, status });
      if (result.result !== 'success') {
        return res.status(502).json({ error: result.message ?? 'WHMCS API error' });
      }

      const ordersRaw = result.orders?.order ?? [];
      const orders = Array.isArray(ordersRaw) ? ordersRaw : ordersRaw ? [ordersRaw] : [];
      const totalresults = Number(result.totalresults ?? orders.length);

      res.json({
        orders,
        totalresults,
        limitstart,
        limitnum,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch orders' });
    }
  });

  router.get('/whmcs/clients', requireAuth(), requireRole('admin'), async (req, res) => {
    // Demo mode
    if (isDemoMode()) {
      return res.json({ clients: DEMO_CLIENTS, totalresults: DEMO_CLIENTS.length, limitstart: 0, limitnum: 50 });
    }

    try {
      const whmcs = await createWhmcsApiClient();
      const limitstart = Number(req.query.limitstart ?? 0);
      const limitnum = Math.min(Number(req.query.limitnum ?? 50), 200);
      const search = req.query.search as string | undefined;

      const result = await whmcs.getClients({ limitstart, limitnum, search });
      if (result.result !== 'success') {
        return res.status(502).json({ error: result.message ?? 'WHMCS API error' });
      }

      const clientsRaw = result.clients?.client ?? [];
      const clients = Array.isArray(clientsRaw) ? clientsRaw : clientsRaw ? [clientsRaw] : [];
      const totalresults = Number(result.totalresults ?? clients.length);

      res.json({
        clients,
        totalresults,
        limitstart,
        limitnum,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch clients' });
    }
  });

  router.get('/whmcs/services', requireAuth(), requireRole('admin'), async (req, res) => {
    // Demo mode
    if (isDemoMode()) {
      return res.json({ services: DEMO_SERVICES, totalresults: DEMO_SERVICES.length, limitstart: 0, limitnum: 50 });
    }

    try {
      const whmcs = await createWhmcsApiClient();
      const limitstart = Number(req.query.limitstart ?? 0);
      const limitnum = Math.min(Number(req.query.limitnum ?? 50), 200);
      const status = req.query.status as string | undefined;

      const result = await whmcs.getAllServices({ limitstart, limitnum, status });
      if (result.result !== 'success') {
        return res.status(502).json({ error: result.message ?? 'WHMCS API error' });
      }

      const servicesRaw = result.services?.service ?? [];
      const servicesArray = Array.isArray(servicesRaw) ? servicesRaw : servicesRaw ? [servicesRaw] : [];
      const totalresults = Number(result.totalresults ?? servicesArray.length);

      // Enrich with server instances
      const serviceIds = servicesArray
        .map((s: any) => Number(s.id))
        .filter((n: number) => Number.isFinite(n));
      
      const servers = serviceIds.length > 0 
        ? await prisma.serverInstance.findMany({
            where: { whmcsServiceId: { in: serviceIds } },
          })
        : [];
      const serverByServiceId = new Map(servers.map((s) => [s.whmcsServiceId, s]));

      const enriched = servicesArray.map((s: any) => {
        const serviceId = Number(s.id);
        const server = serverByServiceId.get(serviceId);
        return {
          ...s,
          server: server
            ? {
                status: server.status,
                ip: server.ip,
                providerResourceId: server.providerResourceId,
              }
            : null,
        };
      });

      res.json({
        services: enriched,
        totalresults,
        limitstart,
        limitnum,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch services' });
    }
  });

  router.get('/whmcs/invoices', requireAuth(), requireRole('admin'), async (req, res) => {
    // Demo mode
    if (isDemoMode()) {
      return res.json({ invoices: DEMO_INVOICES, totalresults: DEMO_INVOICES.length, limitstart: 0, limitnum: 50 });
    }

    try {
      const whmcs = await createWhmcsApiClient();
      const limitstart = Number(req.query.limitstart ?? 0);
      const limitnum = Math.min(Number(req.query.limitnum ?? 50), 200);
      const status = req.query.status as string | undefined;

      const result = await whmcs.getInvoices({ limitstart, limitnum, status });
      if (result.result !== 'success') {
        return res.status(502).json({ error: result.message ?? 'WHMCS API error' });
      }

      const invoicesRaw = result.invoices?.invoice ?? [];
      const invoices = Array.isArray(invoicesRaw) ? invoicesRaw : invoicesRaw ? [invoicesRaw] : [];
      const totalresults = Number(result.totalresults ?? invoices.length);

      res.json({
        invoices,
        totalresults,
        limitstart,
        limitnum,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch invoices' });
    }
  });

  router.get('/whmcs/stats', requireAuth(), requireRole('admin'), async (_req, res) => {
    // Demo mode
    if (isDemoMode()) {
      return res.json({ stats: DEMO_STATS });
    }

    try {
      const whmcs = await createWhmcsApiClient();

      // Fetch summary data
      const [ordersResult, clientsResult, servicesResult, invoicesResult] = await Promise.all([
        whmcs.getOrders({ limitnum: 1 }),
        whmcs.getClients({ limitnum: 1 }),
        whmcs.getAllServices({ limitnum: 1 }),
        whmcs.getInvoices({ limitnum: 1 }),
      ]);

      const stats = {
        totalOrders: ordersResult.result === 'success' ? Number(ordersResult.totalresults ?? 0) : 0,
        totalClients: clientsResult.result === 'success' ? Number(clientsResult.totalresults ?? 0) : 0,
        totalServices: servicesResult.result === 'success' ? Number(servicesResult.totalresults ?? 0) : 0,
        totalInvoices: invoicesResult.result === 'success' ? Number(invoicesResult.totalresults ?? 0) : 0,
      };

      res.json({ stats });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch stats' });
    }
  });

  // Products
  router.get('/whmcs/products', requireAuth(), requireRole('admin'), async (req, res) => {
    // Demo mode
    if (isDemoMode()) {
      const demoProducts = [
        { id: '1', name: 'VPS Basic', description: 'Entry-level VPS', type: 'server', paytype: 'recurring', pricing: { USD: { monthly: '29.99' } } },
        { id: '2', name: 'VPS Pro', description: 'Professional VPS', type: 'server', paytype: 'recurring', pricing: { USD: { monthly: '49.99' } } },
        { id: '3', name: 'VPS Enterprise', description: 'Enterprise-grade VPS', type: 'server', paytype: 'recurring', pricing: { USD: { monthly: '99.99' } } },
      ];
      return res.json({ products: demoProducts, totalresults: demoProducts.length, limitstart: 0, limitnum: 50 });
    }

    try {
      const whmcs = await createWhmcsApiClient();
      const limitstart = Number(req.query.limitstart ?? 0);
      const limitnum = Math.min(Number(req.query.limitnum ?? 50), 200);
      const gid = req.query.gid ? Number(req.query.gid) : undefined;

      const result = await whmcs.getProducts({ limitstart, limitnum, gid });
      if (result.result !== 'success') {
        return res.status(502).json({ error: result.message ?? 'WHMCS API error' });
      }

      const productsRaw = result.products?.product ?? [];
      const products = Array.isArray(productsRaw) ? productsRaw : productsRaw ? [productsRaw] : [];
      const totalresults = Number(result.totalresults ?? products.length);

      res.json({
        products,
        totalresults,
        limitstart,
        limitnum,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch products' });
    }
  });

  // Domains
  router.get('/whmcs/domains', requireAuth(), requireRole('admin'), async (req, res) => {
    // Demo mode
    if (isDemoMode()) {
      const demoDomains = [
        { id: '1', domain: 'example.com', userid: '1', status: 'Active', registrationdate: '2024-01-15', expirydate: '2025-01-15', registrar: 'demo' },
        { id: '2', domain: 'demo-site.net', userid: '2', status: 'Active', registrationdate: '2024-03-20', expirydate: '2025-03-20', registrar: 'demo' },
      ];
      return res.json({ domains: demoDomains, totalresults: demoDomains.length, limitstart: 0, limitnum: 50 });
    }

    try {
      const whmcs = await createWhmcsApiClient();
      const limitstart = Number(req.query.limitstart ?? 0);
      const limitnum = Math.min(Number(req.query.limitnum ?? 50), 200);
      const clientid = req.query.clientid ? Number(req.query.clientid) : undefined;
      const status = req.query.status as string | undefined;

      const result = await whmcs.getDomains({ limitstart, limitnum, clientid, status });
      if (result.result !== 'success') {
        return res.status(502).json({ error: result.message ?? 'WHMCS API error' });
      }

      const domainsRaw = result.domains?.domain ?? [];
      const domains = Array.isArray(domainsRaw) ? domainsRaw : domainsRaw ? [domainsRaw] : [];
      const totalresults = Number(result.totalresults ?? domains.length);

      res.json({
        domains,
        totalresults,
        limitstart,
        limitnum,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch domains' });
    }
  });

  // Tickets
  router.get('/whmcs/tickets', requireAuth(), requireRole('admin'), async (req, res) => {
    // Demo mode
    if (isDemoMode()) {
      const demoTickets = [
        { id: '1', tid: 'TKT-001', userid: '1', name: 'John Doe', subject: 'Server Setup Help', status: 'Open', priority: 'Medium', lastreply: '2024-06-15' },
        { id: '2', tid: 'TKT-002', userid: '2', name: 'Jane Smith', subject: 'Billing Question', status: 'Answered', priority: 'Low', lastreply: '2024-06-14' },
      ];
      return res.json({ tickets: demoTickets, totalresults: demoTickets.length, limitstart: 0, limitnum: 50 });
    }

    try {
      const whmcs = await createWhmcsApiClient();
      const limitstart = Number(req.query.limitstart ?? 0);
      const limitnum = Math.min(Number(req.query.limitnum ?? 50), 200);
      const status = req.query.status as string | undefined;
      const deptid = req.query.deptid ? Number(req.query.deptid) : undefined;

      const result = await whmcs.getTickets({ limitstart, limitnum, status, deptid });
      if (result.result !== 'success') {
        return res.status(502).json({ error: result.message ?? 'WHMCS API error' });
      }

      const ticketsRaw = result.tickets?.ticket ?? [];
      const tickets = Array.isArray(ticketsRaw) ? ticketsRaw : ticketsRaw ? [ticketsRaw] : [];
      const totalresults = Number(result.totalresults ?? tickets.length);

      res.json({
        tickets,
        totalresults,
        limitstart,
        limitnum,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch tickets' });
    }
  });

  // Transactions
  router.get('/whmcs/transactions', requireAuth(), requireRole('admin'), async (req, res) => {
    // Demo mode
    if (isDemoMode()) {
      const demoTransactions = [
        { id: '1', userid: '1', currency: 'USD', gateway: 'paypal', date: '2024-06-01', description: 'Payment', amountin: '29.99', amountout: '0.00' },
        { id: '2', userid: '2', currency: 'USD', gateway: 'stripe', date: '2024-06-15', description: 'Payment', amountin: '49.99', amountout: '0.00' },
        { id: '3', userid: '1', currency: 'USD', gateway: 'paypal', date: '2024-07-01', description: 'Payment', amountin: '99.99', amountout: '0.00' },
      ];
      return res.json({ transactions: demoTransactions, totalresults: demoTransactions.length, limitstart: 0, limitnum: 50 });
    }

    try {
      const whmcs = await createWhmcsApiClient();
      const limitstart = Number(req.query.limitstart ?? 0);
      const limitnum = Math.min(Number(req.query.limitnum ?? 50), 200);
      const status = req.query.status as string | undefined;

      const result = await whmcs.getTransactions({ limitstart, limitnum, status });
      if (result.result !== 'success') {
        return res.status(502).json({ error: result.message ?? 'WHMCS API error' });
      }

      const transactionsRaw = result.transactions?.transaction ?? [];
      const transactions = Array.isArray(transactionsRaw) ? transactionsRaw : transactionsRaw ? [transactionsRaw] : [];
      const totalresults = Number(result.totalresults ?? transactions.length);

      res.json({
        transactions,
        totalresults,
        limitstart,
        limitnum,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch transactions' });
    }
  });

  // Currencies
  router.get('/whmcs/currencies', requireAuth(), requireRole('admin'), async (_req, res) => {
    // Demo mode
    if (isDemoMode()) {
      const demoCurrencies = [
        { id: '1', code: 'USD', prefix: '$', suffix: '', default: '1', rate: '1.00000' },
        { id: '2', code: 'EUR', prefix: '€', suffix: '', default: '0', rate: '0.92000' },
      ];
      return res.json({ currencies: demoCurrencies });
    }

    try {
      const whmcs = await createWhmcsApiClient();
      const result = await whmcs.getCurrencies();
      if (result.result !== 'success') {
        return res.status(502).json({ error: result.message ?? 'WHMCS API error' });
      }

      const currenciesRaw = result.currencies?.currency ?? [];
      const currencies = Array.isArray(currenciesRaw) ? currenciesRaw : currenciesRaw ? [currenciesRaw] : [];
      res.json({ currencies });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch currencies' });
    }
  });

  // Payment Methods
  router.get('/whmcs/payment-methods', requireAuth(), requireRole('admin'), async (_req, res) => {
    // Demo mode
    if (isDemoMode()) {
      const demoPaymentMethods = [
        { module: 'paypal', displayname: 'PayPal', type: 'Invoices' },
        { module: 'stripe', displayname: 'Stripe', type: 'Invoices' },
        { module: 'banktransfer', displayname: 'Bank Transfer', type: 'Invoices' },
      ];
      return res.json({ paymentMethods: demoPaymentMethods });
    }

    try {
      const whmcs = await createWhmcsApiClient();
      const result = await whmcs.getPaymentMethods();
      if (result.result !== 'success') {
        return res.status(502).json({ error: result.message ?? 'WHMCS API error' });
      }

      const paymentMethodsRaw = result.paymentmethods?.paymentmethod ?? [];
      const paymentMethods = Array.isArray(paymentMethodsRaw) ? paymentMethodsRaw : paymentMethodsRaw ? [paymentMethodsRaw] : [];
      res.json({ paymentMethods });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch payment methods' });
    }
  });

  return router;
}


