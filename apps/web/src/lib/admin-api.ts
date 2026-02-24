/**
 * Admin API Client
 * 
 * Type-safe client for all /admin/* API routes.
 * Uses httpOnly cookies for auth (set by /auth/login).
 * Automatically redirects to /admin/login on 401.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ── Generic fetch wrapper ─────────────────────────────────────────────────

async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE}${path}`;

    const res = await fetch(url, {
        ...options,
        credentials: 'include', // Send httpOnly cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (res.status === 401) {
        if (typeof window !== 'undefined') window.location.href = '/admin/login';
        throw new Error('Unauthorized');
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.error ?? data.message ?? `HTTP ${res.status}`);
    }

    return data as T;
}

function qs(params: Record<string, string | number | undefined>): string {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') p.append(k, String(v));
    }
    const s = p.toString();
    return s ? `?${s}` : '';
}

// ── Types ─────────────────────────────────────────────────────────────────

export interface PaginatedQuery {
    limitstart?: number;
    limitnum?: number;
    search?: string;
    status?: string;
}

export interface AdminStats {
    totalOrders: number;
    totalClients: number;
    totalServices: number;
    totalInvoices: number;
}

export interface WhmcsClient {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    companyname?: string;
    status: string;
    datecreated: string;
    [key: string]: unknown;
}

export interface WhmcsOrder {
    id: string;
    ordernum?: string;
    userid: string;
    date: string;
    status: string;
    amount?: string;
    [key: string]: unknown;
}

export interface WhmcsInvoice {
    id: string;
    userid: string;
    invoicenum?: string;
    date: string;
    duedate: string;
    total: string;
    status: string;
    [key: string]: unknown;
}

export interface WhmcsProduct {
    id: string;
    pid?: string;
    name: string;
    description?: string;
    type: string;
    paytype: string;
    pricing?: Record<string, unknown>;
    [key: string]: unknown;
}

export interface WhmcsService {
    id: string;
    userid: string;
    domain?: string;
    status: string;
    amount?: string;
    nextduedate?: string;
    server?: { status: string; ip: string | null; providerResourceId: string } | null;
    [key: string]: unknown;
}

export interface WhmcsDomain {
    id: string;
    userid: string;
    domain: string;
    status: string;
    registrationdate?: string;
    expirydate?: string;
    [key: string]: unknown;
}

export interface WhmcsTicket {
    id: string;
    tid: string;
    userid?: string;
    subject: string;
    status: string;
    priority: 'Low' | 'Medium' | 'High';
    lastreply?: string;
    [key: string]: unknown;
}

export interface WhmcsTransaction {
    id: string;
    userid: string;
    currency: string;
    gateway: string;
    date: string;
    amountin: string;
    amountout: string;
    [key: string]: unknown;
}

export interface Provider {
    id: string;
    type: string;
    displayName: string;
    enabled: boolean;
    createdAt: string;
}

export interface ProductMapping {
    id: string;
    whmcsProductId: number;
    providerId: string;
    credentialId: string;
    planRef: Record<string, unknown>;
    createdAt: string;
}

export interface ServerInstance {
    id: string;
    whmcsServiceId: number;
    status: string;
    ip: string | null;
    region: string | null;
    metadata: Record<string, unknown>;
    createdAt: string;
}

// ── Admin API methods ─────────────────────────────────────────────────────

export const adminApi = {
    // ── Auth ────────────────────────────────────────────────────────────────
    me: () => apiFetch<{ user: { id: number; email: string; firstname: string; role: string } }>('/auth/me'),

    // ── Stats ────────────────────────────────────────────────────────────────
    getStats: () =>
        apiFetch<{ stats: AdminStats }>('/admin/whmcs/stats'),

    // ── Clients ──────────────────────────────────────────────────────────────
    getClients: (q: PaginatedQuery = {}) =>
        apiFetch<{ clients: WhmcsClient[]; totalresults: number; limitstart: number; limitnum: number }>(
            `/admin/whmcs/clients${qs(q)}`
        ),

    // ── Orders ───────────────────────────────────────────────────────────────
    getOrders: (q: PaginatedQuery = {}) =>
        apiFetch<{ orders: WhmcsOrder[]; totalresults: number; limitstart: number; limitnum: number }>(
            `/admin/whmcs/orders${qs(q)}`
        ),

    acceptOrder: (orderId: number) =>
        apiFetch<{ ok: boolean }>(`/admin/whmcs/orders/${orderId}/accept`, { method: 'POST' }),

    cancelOrder: (orderId: number) =>
        apiFetch<{ ok: boolean }>(`/admin/whmcs/orders/${orderId}/cancel`, { method: 'POST' }),

    // ── Invoices ─────────────────────────────────────────────────────────────
    getInvoices: (q: PaginatedQuery = {}) =>
        apiFetch<{ invoices: WhmcsInvoice[]; totalresults: number; limitstart: number; limitnum: number }>(
            `/admin/whmcs/invoices${qs(q)}`
        ),

    applyInvoicePayment: (invoiceId: number, body: { gateway: string; amount: number; date?: string }) =>
        apiFetch<{ ok: boolean }>(`/whmcs/invoices/${invoiceId}/apply-payment`, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    // ── Products ─────────────────────────────────────────────────────────────
    getProducts: (q: PaginatedQuery = {}) =>
        apiFetch<{ products: WhmcsProduct[]; totalresults: number; limitstart: number; limitnum: number }>(
            `/admin/whmcs/products${qs(q)}`
        ),

    // ── Services ─────────────────────────────────────────────────────────────
    getServices: (q: PaginatedQuery = {}) =>
        apiFetch<{ services: WhmcsService[]; totalresults: number; limitstart: number; limitnum: number }>(
            `/admin/whmcs/services${qs(q)}`
        ),

    // ── Domains ──────────────────────────────────────────────────────────────
    getDomains: (q: PaginatedQuery & { clientid?: number } = {}) =>
        apiFetch<{ domains: WhmcsDomain[]; totalresults: number; limitstart: number; limitnum: number }>(
            `/admin/whmcs/domains${qs(q)}`
        ),

    // ── Tickets ──────────────────────────────────────────────────────────────
    getTickets: (q: PaginatedQuery & { deptid?: number } = {}) =>
        apiFetch<{ tickets: WhmcsTicket[]; totalresults: number; limitstart: number; limitnum: number }>(
            `/admin/whmcs/tickets${qs(q)}`
        ),

    replyTicket: (ticketId: string, message: string, adminusername?: string) =>
        apiFetch<{ ok: boolean }>(`/whmcs/tickets/${ticketId}/reply`, {
            method: 'POST',
            body: JSON.stringify({ message, adminusername }),
        }),

    closeTicket: (ticketId: string) =>
        apiFetch<{ ok: boolean }>(`/whmcs/tickets/${ticketId}/close`, { method: 'PUT' }),

    // ── Transactions ─────────────────────────────────────────────────────────
    getTransactions: (q: PaginatedQuery = {}) =>
        apiFetch<{ transactions: WhmcsTransaction[]; totalresults: number; limitstart: number; limitnum: number }>(
            `/admin/whmcs/transactions${qs(q)}`
        ),

    // ── Audit Logs ────────────────────────────────────────────────────────────
    getAuditLogs: (limit = 50) =>
        apiFetch<{ logs: unknown[] }>(`/admin/audit-logs?limit=${limit}`),

    getWebhookDeliveries: (limit = 50) =>
        apiFetch<{ deliveries: unknown[] }>(`/admin/webhook-deliveries?limit=${limit}`),

    // ── Providers ────────────────────────────────────────────────────────────
    getProviders: () => apiFetch<{ providers: Provider[] }>('/admin/providers'),

    createProvider: (body: { type: string; displayName: string; enabled: boolean }) =>
        apiFetch<{ provider: Provider }>('/admin/providers', {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    addProviderCredential: (providerId: string, body: { label: string; secretValue: string; kmsKeyId: string }) =>
        apiFetch<{ credentialId: string }>(`/admin/providers/${providerId}/credentials`, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    // ── Product Mappings ─────────────────────────────────────────────────────
    getProductMappings: () => apiFetch<{ mappings: ProductMapping[] }>('/admin/product-mappings'),

    upsertProductMapping: (body: {
        whmcsProductId: number;
        providerId: string;
        credentialId: string;
        planRef: Record<string, unknown>;
    }) =>
        apiFetch<{ mapping: ProductMapping }>('/admin/product-mappings', {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    // ── WHMCS Connection ─────────────────────────────────────────────────────
    getWhmcsConnection: () => apiFetch<{ connection: unknown }>('/admin/whmcs'),

    setWhmcsConnection: (body: { baseUrl: string; apiIdentifier: string; apiSecret: string; kmsKeyId: string }) =>
        apiFetch<{ connection: unknown }>('/admin/whmcs', {
            method: 'PUT',
            body: JSON.stringify(body),
        }),

    // ── App Config ────────────────────────────────────────────────────────────
    getAppConfig: () => apiFetch<{ config: { adminClientGroupId: number | null } }>('/admin/app-config'),
};

export default adminApi;
