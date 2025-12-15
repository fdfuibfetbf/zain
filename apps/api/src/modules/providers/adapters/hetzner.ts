import type { ProviderAdapter, ProviderActionResult, CreateServerRequest, CreateServerResponse } from '../types.js';

type HetznerCredential = { token: string };

function parseCredential(credentialPlaintext: string): HetznerCredential {
  try {
    const json = JSON.parse(credentialPlaintext) as any;
    if (typeof json?.token === 'string') return { token: json.token };
  } catch {
    // ignore
  }
  return { token: credentialPlaintext.trim() };
}

async function hetznerFetch<T>(args: {
  token: string;
  path: string;
  method?: string;
  body?: unknown;
}): Promise<T> {
  const res = await fetch(`https://api.hetzner.cloud/v1${args.path}`, {
    method: args.method ?? 'GET',
    headers: {
      authorization: `Bearer ${args.token}`,
      'content-type': 'application/json',
    },
    body: args.body ? JSON.stringify(args.body) : undefined,
  });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as any) : null;
  if (!res.ok) {
    throw new Error(`Hetzner API ${res.status}: ${JSON.stringify(data)}`);
  }
  return data as T;
}

export class HetznerAdapter implements ProviderAdapter {
  readonly type = 'hetzner';
  private readonly token: string;

  constructor(credentialPlaintext: string) {
    this.token = parseCredential(credentialPlaintext).token;
  }

  async createServer(req: CreateServerRequest): Promise<ProviderActionResult<CreateServerResponse>> {
    try {
      const image = String(req.planRef.image ?? req.planRef.imageId ?? req.planRef.os ?? '');
      const serverType = String(req.planRef.serverType ?? req.planRef.server_type ?? req.planRef.size ?? '');
      const location = req.planRef.location ? String(req.planRef.location) : undefined;
      const datacenter = req.planRef.datacenter ? String(req.planRef.datacenter) : undefined;

      if (!image || !serverType) {
        return { ok: false, error: 'Missing planRef.image and/or planRef.serverType for Hetzner' };
      }

      const out = await hetznerFetch<any>({
        token: this.token,
        path: '/servers',
        method: 'POST',
        body: {
          name: req.name,
          server_type: serverType,
          image,
          user_data: req.userData,
          location,
          datacenter,
        },
      });

      const server = out?.server;
      const providerResourceId = String(server?.id);
      const ip = server?.public_net?.ipv4?.ip as string | undefined;

      return { ok: true, value: { providerResourceId, ip, raw: out } };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Hetzner create failed', retryable: true };
    }
  }

  async suspendServer(providerResourceId: string): Promise<ProviderActionResult<void>> {
    // Hetzner doesn't have "suspend"; map to power_off.
    return this.powerOff(providerResourceId);
  }

  async rebootServer(providerResourceId: string): Promise<ProviderActionResult<void>> {
    try {
      await hetznerFetch({
        token: this.token,
        path: `/servers/${providerResourceId}/actions/reboot`,
        method: 'POST',
        body: {},
      });
      return { ok: true, value: undefined };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Hetzner reboot failed', retryable: true };
    }
  }

  async terminateServer(providerResourceId: string): Promise<ProviderActionResult<void>> {
    try {
      await hetznerFetch({
        token: this.token,
        path: `/servers/${providerResourceId}`,
        method: 'DELETE',
      });
      return { ok: true, value: undefined };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Hetzner delete failed', retryable: true };
    }
  }

  async reinstallServer(providerResourceId: string, planRef?: Record<string, unknown>): Promise<ProviderActionResult<void>> {
    try {
      const image = planRef ? String((planRef as any).image ?? (planRef as any).imageId ?? '') : '';
      if (!image) return { ok: false, error: 'Missing planRef.image for Hetzner reinstall' };
      await hetznerFetch({
        token: this.token,
        path: `/servers/${providerResourceId}/actions/rebuild`,
        method: 'POST',
        body: { image },
      });
      return { ok: true, value: undefined };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Hetzner rebuild failed', retryable: true };
    }
  }

  async powerOn(providerResourceId: string): Promise<ProviderActionResult<void>> {
    try {
      await hetznerFetch({
        token: this.token,
        path: `/servers/${providerResourceId}/actions/poweron`,
        method: 'POST',
        body: {},
      });
      return { ok: true, value: undefined };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Hetzner poweron failed', retryable: true };
    }
  }

  async powerOff(providerResourceId: string): Promise<ProviderActionResult<void>> {
    try {
      await hetznerFetch({
        token: this.token,
        path: `/servers/${providerResourceId}/actions/poweroff`,
        method: 'POST',
        body: {},
      });
      return { ok: true, value: undefined };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Hetzner poweroff failed', retryable: true };
    }
  }
}


