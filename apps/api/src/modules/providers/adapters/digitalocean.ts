import type { ProviderAdapter, ProviderActionResult, CreateServerRequest, CreateServerResponse } from '../types.js';

type DoCredential = { token: string };

function parseCredential(credentialPlaintext: string): DoCredential {
  try {
    const json = JSON.parse(credentialPlaintext) as any;
    if (typeof json?.token === 'string') return { token: json.token };
  } catch {
    // ignore
  }
  return { token: credentialPlaintext.trim() };
}

async function doFetch<T>(args: { token: string; path: string; method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`https://api.digitalocean.com/v2${args.path}`, {
    method: args.method ?? 'GET',
    headers: {
      authorization: `Bearer ${args.token}`,
      'content-type': 'application/json',
    },
    body: args.body ? JSON.stringify(args.body) : undefined,
  });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as any) : null;
  if (!res.ok) throw new Error(`DigitalOcean API ${res.status}: ${JSON.stringify(data)}`);
  return data as T;
}

export class DigitalOceanAdapter implements ProviderAdapter {
  readonly type = 'digitalocean';
  private readonly token: string;

  constructor(credentialPlaintext: string) {
    this.token = parseCredential(credentialPlaintext).token;
  }

  async createServer(req: CreateServerRequest): Promise<ProviderActionResult<CreateServerResponse>> {
    try {
      const region = String(req.planRef.region ?? '');
      const size = String(req.planRef.size ?? '');
      const image = req.planRef.image;
      const sshKeys = Array.isArray(req.planRef.ssh_keys) ? req.planRef.ssh_keys : undefined;

      if (!region || !size || !image) {
        return { ok: false, error: 'Missing planRef.region/size/image for DigitalOcean' };
      }

      const out = await doFetch<any>({
        token: this.token,
        path: '/droplets',
        method: 'POST',
        body: {
          name: req.name,
          region,
          size,
          image,
          user_data: req.userData,
          ssh_keys: sshKeys,
        },
      });

      const dropletId = String(out?.droplet?.id);
      return { ok: true, value: { providerResourceId: dropletId, raw: out } };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'DigitalOcean create failed', retryable: true };
    }
  }

  async suspendServer(providerResourceId: string): Promise<ProviderActionResult<void>> {
    return this.powerOff(providerResourceId);
  }

  async rebootServer(providerResourceId: string): Promise<ProviderActionResult<void>> {
    try {
      await doFetch({
        token: this.token,
        path: `/droplets/${providerResourceId}/actions`,
        method: 'POST',
        body: { type: 'reboot' },
      });
      return { ok: true, value: undefined };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'DigitalOcean reboot failed', retryable: true };
    }
  }

  async terminateServer(providerResourceId: string): Promise<ProviderActionResult<void>> {
    try {
      await doFetch({
        token: this.token,
        path: `/droplets/${providerResourceId}`,
        method: 'DELETE',
      });
      return { ok: true, value: undefined };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'DigitalOcean delete failed', retryable: true };
    }
  }

  async reinstallServer(providerResourceId: string): Promise<ProviderActionResult<void>> {
    // Droplet rebuild requires image id/slugs; map to "rebuild" not implemented yet.
    return { ok: false, error: 'DigitalOcean reinstall not implemented yet' };
  }

  async powerOn(providerResourceId: string): Promise<ProviderActionResult<void>> {
    try {
      await doFetch({
        token: this.token,
        path: `/droplets/${providerResourceId}/actions`,
        method: 'POST',
        body: { type: 'power_on' },
      });
      return { ok: true, value: undefined };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'DigitalOcean power_on failed', retryable: true };
    }
  }

  async powerOff(providerResourceId: string): Promise<ProviderActionResult<void>> {
    try {
      await doFetch({
        token: this.token,
        path: `/droplets/${providerResourceId}/actions`,
        method: 'POST',
        body: { type: 'power_off' },
      });
      return { ok: true, value: undefined };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'DigitalOcean power_off failed', retryable: true };
    }
  }
}


