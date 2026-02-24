/**
 * User Panel API Client
 *
 * Type-safe client for all /panel/* API routes.
 * Uses httpOnly cookies for auth (set by /auth/login).
 * Automatically redirects to /panel/login on 401.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ── Generic fetch wrapper ──────────────────────────────────────────────────

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
        if (typeof window !== 'undefined') window.location.href = '/panel/login';
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

export interface PanelService {
    serviceId: number;
    productId: number;
    name: string;
    status: string;
    domain?: string;
    amount?: string;
    currency?: string;
    nextduedate?: string;
    server?: {
        id: string;
        status: string;
        ip: string | null;
        region: string | null;
        providerResourceId: string;
        provider: string;
        providerType: string;
        metadata: Record<string, unknown>;
        createdAt: string;
        updatedAt: string;
    } | null;
}

export interface PanelDomain {
    id: string;
    domain: string;
    status: string;
    registrationdate?: string;
    expirydate?: string;
    nameservers?: string[];
    [key: string]: unknown;
}

export interface PanelInvoice {
    id: string;
    invoicenum?: string;
    date: string;
    duedate: string;
    total: string;
    balance: string;
    status: string;
    paymentmethod?: string;
    [key: string]: unknown;
}

export interface PanelTicket {
    id: string;
    tid: string;
    subject: string;
    status: string;
    priority: 'Low' | 'Medium' | 'High';
    lastreply?: string;
    [key: string]: unknown;
}

export interface ActionRequest {
    id: string;
    action: string;
    status: string;
    requestedAt: string;
    startedAt?: string;
    completedAt?: string;
    error?: string;
}

export interface UserProfile {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    companyname?: string;
    phonenumber?: string;
    address1?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    credit?: string;
    [key: string]: unknown;
}

// ── Panel API methods ─────────────────────────────────────────────────────

export const panelApi = {
    // ── Auth ────────────────────────────────────────────────────────────────
    me: () =>
        apiFetch<{ user: UserProfile & { role: string } }>('/auth/me'),

    login: (email: string, password: string) =>
        apiFetch<{ ok: boolean; whmcsUserId: number; role: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (data: {
        firstname: string;
        lastname: string;
        email: string;
        password: string;
        phonenumber?: string;
        companyname?: string;
        address1?: string;
        city?: string;
        state?: string;
        postcode?: string;
        country?: string;
    }) =>
        apiFetch<{ ok: boolean; whmcsUserId?: number; role?: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    logout: () =>
        apiFetch<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

    refresh: () =>
        apiFetch<{ ok: boolean; whmcsUserId: number; role: string }>('/auth/refresh', { method: 'POST' }),

    // ── Services ─────────────────────────────────────────────────────────────
    getServices: () =>
        apiFetch<{ services: PanelService[] }>('/panel/services'),

    getService: (serviceId: number) =>
        apiFetch<{
            service: PanelService;
            server: PanelService['server'];
            actions: ActionRequest[];
        }>(`/panel/services/${serviceId}`),

    performServiceAction: (
        serviceId: number,
        action: 'reboot' | 'suspend' | 'terminate' | 'reinstall' | 'power_on' | 'power_off',
        idempotencyKey?: string
    ) =>
        apiFetch<{ ok: boolean }>(`/panel/services/${serviceId}/actions`, {
            method: 'POST',
            body: JSON.stringify({ action }),
            headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
        }),

    getServiceActions: (serviceId: number, limit = 50) =>
        apiFetch<{ actions: ActionRequest[] }>(`/panel/services/${serviceId}/actions?limit=${limit}`),

    // ── Domains ──────────────────────────────────────────────────────────────
    getDomains: () =>
        apiFetch<{ domains: PanelDomain[]; totalresults: number }>('/whmcs/domains'),

    registerDomain: (data: {
        clientid: number;
        domain: string;
        billingcycle?: string;
        paymentmethod?: string;
    }) =>
        apiFetch<{ ok: boolean; orderid?: string }>('/whmcs/orders', {
            method: 'POST',
            body: JSON.stringify({ ...data, pid: 0 }), // pid resolved server-side for domain product
        }),

    updateDomainNameservers: (domainId: number, ns: { ns1: string; ns2: string; ns3?: string; ns4?: string }) =>
        apiFetch<{ ok: boolean }>(`/whmcs/domains/${domainId}/nameservers`, {
            method: 'PUT',
            body: JSON.stringify(ns),
        }),

    // ── Invoices ─────────────────────────────────────────────────────────────
    getInvoices: (q: { limitstart?: number; limitnum?: number; status?: string } = {}) =>
        apiFetch<{ success: boolean; data: { invoices: PanelInvoice[]; totalresults: number } }>(
            `/whmcs/invoices${qs(q)}`
        ),

    getInvoice: (invoiceId: number) =>
        apiFetch<{ success: boolean; data: PanelInvoice }>(`/whmcs/invoices/${invoiceId}`),

    // ── Tickets ──────────────────────────────────────────────────────────────
    getTickets: (q: { limitstart?: number; limitnum?: number; status?: string } = {}) =>
        apiFetch<{ success: boolean; data: { tickets: PanelTicket[]; totalresults: number } }>(
            `/whmcs/tickets${qs(q)}`
        ),

    openTicket: (data: {
        clientid: number;
        deptid: number;
        subject: string;
        message: string;
        priority: 'Low' | 'Medium' | 'High';
    }) =>
        apiFetch<{ success: boolean; data: { ticketid: string } }>('/whmcs/tickets', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    replyTicket: (ticketId: string, message: string) =>
        apiFetch<{ success: boolean }>(`/whmcs/tickets/${ticketId}/reply`, {
            method: 'POST',
            body: JSON.stringify({ message }),
        }),

    // ── Profile ──────────────────────────────────────────────────────────────
    getProfile: () =>
        apiFetch<{ user: UserProfile & { role: string } }>('/auth/me'),

    updateProfile: (clientId: number, data: Partial<UserProfile>) =>
        apiFetch<{ success: boolean; message: string }>(`/whmcs/clients/${clientId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    // ── OpenID Connect ────────────────────────────────────────────────────────
    getOpenIdClients: () =>
        apiFetch<{ clients: unknown[] }>('/panel/openid-connect'),

    createOpenIdClient: (data: { name: string; description?: string }) =>
        apiFetch<{ clientid: string; clientsecret: string }>('/panel/openid-connect', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    deleteOpenIdClient: (id: string) =>
        apiFetch<{ success: boolean }>(`/panel/openid-connect/${id}`, { method: 'DELETE' }),

    // ── Storage & Backups ─────────────────────────────────────────────────────
    getStorageSettings: () =>
        apiFetch<{ settings: Record<string, unknown> }>('/panel/storage-settings'),

    updateStorageSettings: (data: Record<string, unknown>) =>
        apiFetch<{ success: boolean }>('/panel/storage-settings', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    getBackupConfig: () =>
        apiFetch<{ configuration: Record<string, unknown> }>('/panel/automatic-backups'),

    updateBackupConfig: (data: Record<string, unknown>) =>
        apiFetch<{ success: boolean }>('/panel/automatic-backups', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    testBackupConnection: (data: {
        hostname: string;
        port: number;
        username: string;
        password: string;
        destination: string;
        secure?: boolean;
        passive?: boolean;
    }) =>
        apiFetch<{ success: boolean; message: string }>('/panel/automatic-backups/test-connection', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

export default panelApi;
