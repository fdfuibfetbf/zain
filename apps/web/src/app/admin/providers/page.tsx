'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '@/lib/api';

type Provider = { id: string; type: string; displayName: string; enabled: boolean };

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState('hetzner');
  const [displayName, setDisplayName] = useState('');

  async function load() {
    setError(null);
    try {
      const out = await apiFetch<{ providers: Provider[] }>('/admin/providers');
      setProviders(out.providers);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createProvider() {
    setError(null);
    try {
      await apiFetch('/admin/providers', {
        method: 'POST',
        body: JSON.stringify({ type, displayName: displayName || type, enabled: true }),
      });
      setDisplayName('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Providers</h1>
      <p className="mt-1 text-sm text-gray-600">Add/edit providers and credentials.</p>

      {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}

      <div className="mt-6 rounded-lg border p-4">
        <div className="text-sm font-semibold">Add provider</div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <div className="font-medium">Type</div>
            <select className="mt-1 w-full rounded-md border px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="hetzner">Hetzner</option>
              <option value="contabo">Contabo</option>
              <option value="datawagon">DataWagon</option>
              <option value="digitalocean">DigitalOcean</option>
              <option value="vultr">Vultr</option>
              <option value="linode">Linode</option>
            </select>
          </label>
          <label className="block text-sm">
            <div className="font-medium">Display name</div>
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </label>
        </div>
        <button className="mt-3 rounded-md bg-black px-3 py-2 text-sm text-white" onClick={createProvider}>
          Create provider
        </button>
      </div>

      <div className="mt-6 rounded-lg border">
        <div className="border-b p-4 text-sm font-semibold">Existing providers</div>
        <div className="divide-y">
          {providers.map((p) => (
            <div key={p.id} className="p-4 text-sm">
              <div className="font-medium">{p.displayName}</div>
              <div className="text-gray-600">
                {p.type} · {p.enabled ? 'enabled' : 'disabled'} · {p.id}
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Add credentials via API for now: POST <code className="rounded bg-gray-100 px-1">/admin/providers/{p.id}/credentials</code>
              </div>
            </div>
          ))}
          {providers.length === 0 ? <div className="p-4 text-sm text-gray-600">No providers yet.</div> : null}
        </div>
      </div>
    </div>
  );
}


