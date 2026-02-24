import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

import { prisma } from '../../prisma/client.js';
import { requireAuth, requireRole } from '../auth/authMiddleware.js';
import { getKmsClientForKeyId } from '../crypto/kms/kmsFactory.js';
import { SecretService } from '../secrets/secretService.js';
import { writeAuditLog } from '../audit/auditLogService.js';

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

  // WHMCS Data Endpoints (Return Demo Data)
  router.get('/whmcs/orders', requireAuth(), requireRole('admin'), async (req, res) => {
    res.json({ orders: DEMO_ORDERS, totalresults: DEMO_ORDERS.length, limitstart: 0, limitnum: 50 });
  });

  router.get('/whmcs/clients', requireAuth(), requireRole('admin'), async (req, res) => {
    res.json({ clients: DEMO_CLIENTS, totalresults: DEMO_CLIENTS.length, limitstart: 0, limitnum: 50 });
  });

  router.get('/whmcs/services', requireAuth(), requireRole('admin'), async (req, res) => {
    res.json({ services: DEMO_SERVICES, totalresults: DEMO_SERVICES.length, limitstart: 0, limitnum: 50 });
  });

  router.get('/whmcs/invoices', requireAuth(), requireRole('admin'), async (req, res) => {
    res.json({ invoices: DEMO_INVOICES, totalresults: DEMO_INVOICES.length, limitstart: 0, limitnum: 50 });
  });

  router.get('/whmcs/stats', requireAuth(), requireRole('admin'), async (_req, res) => {
    res.json({ stats: DEMO_STATS });
  });

  router.get('/whmcs/products', requireAuth(), requireRole('admin'), async (req, res) => {
    const demoProducts = [
      { id: '1', name: 'VPS Basic', description: 'Entry-level VPS', type: 'server', paytype: 'recurring', pricing: { USD: { monthly: '29.99' } } },
      { id: '2', name: 'VPS Pro', description: 'Professional VPS', type: 'server', paytype: 'recurring', pricing: { USD: { monthly: '49.99' } } },
      { id: '3', name: 'VPS Enterprise', description: 'Enterprise-grade VPS', type: 'server', paytype: 'recurring', pricing: { USD: { monthly: '99.99' } } },
    ];
    res.json({ products: demoProducts, totalresults: demoProducts.length, limitstart: 0, limitnum: 50 });
  });

  router.get('/whmcs/domains', requireAuth(), requireRole('admin'), async (req, res) => {
    const demoDomains = [
      { id: '1', domain: 'example.com', userid: '1', status: 'Active', registrationdate: '2024-01-15', expirydate: '2025-01-15', registrar: 'demo' },
      { id: '2', domain: 'demo-site.net', userid: '2', status: 'Active', registrationdate: '2024-03-20', expirydate: '2025-03-20', registrar: 'demo' },
    ];
    res.json({ domains: demoDomains, totalresults: demoDomains.length, limitstart: 0, limitnum: 50 });
  });

  router.get('/whmcs/tickets', requireAuth(), requireRole('admin'), async (req, res) => {
    const demoTickets = [
      { id: '1', tid: 'TKT-001', userid: '1', name: 'John Doe', subject: 'Server Setup Help', status: 'Open', priority: 'Medium', lastreply: '2024-06-15' },
      { id: '2', tid: 'TKT-002', userid: '2', name: 'Jane Smith', subject: 'Billing Question', status: 'Answered', priority: 'Low', lastreply: '2024-06-14' },
    ];
    res.json({ tickets: demoTickets, totalresults: demoTickets.length, limitstart: 0, limitnum: 50 });
  });

  router.get('/whmcs/transactions', requireAuth(), requireRole('admin'), async (req, res) => {
    const demoTransactions = [
      { id: '1', userid: '1', currency: 'USD', gateway: 'paypal', date: '2024-06-01', description: 'Payment', amountin: '29.99', amountout: '0.00' },
      { id: '2', userid: '2', currency: 'USD', gateway: 'stripe', date: '2024-06-15', description: 'Payment', amountin: '49.99', amountout: '0.00' },
      { id: '3', userid: '1', currency: 'USD', gateway: 'paypal', date: '2024-07-01', description: 'Payment', amountin: '99.99', amountout: '0.00' },
    ];
    res.json({ transactions: demoTransactions, totalresults: demoTransactions.length, limitstart: 0, limitnum: 50 });
  });

  router.get('/whmcs/currencies', requireAuth(), requireRole('admin'), async (_req, res) => {
    const demoCurrencies = [
      { id: '1', code: 'USD', prefix: '$', suffix: '', default: '1', rate: '1.00000' },
      { id: '2', code: 'EUR', prefix: '€', suffix: '', default: '0', rate: '0.92000' },
    ];
    res.json({ currencies: { currency: demoCurrencies } });
  });

  return router;
}
