'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '@/lib/api';

type Mapping = { id: string; whmcsProductId: number; providerId: string; credentialId: string; planRef: any };

export default function ProductMappingsPage() {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [whmcsProductId, setWhmcsProductId] = useState('');
  const [providerId, setProviderId] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [planRefJson, setPlanRefJson] = useState('{"region":"fsn1","size":"small"}');

  async function load() {
    setError(null);
    try {
      const out = await apiFetch<{ mappings: Mapping[] }>('/admin/product-mappings');
      setMappings(out.mappings);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function upsert() {
    setError(null);
    try {
      const planRef = JSON.parse(planRefJson);
      await apiFetch('/admin/product-mappings', {
        method: 'POST',
        body: JSON.stringify({
          whmcsProductId: Number(whmcsProductId),
          providerId,
          credentialId,
          planRef,
        }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Product mappings</h1>
      <p className="mt-1 text-sm text-gray-600">Map WHMCS product IDs to provider + credential + planRef.</p>

      {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}

      <div className="mt-6 rounded-lg border p-4">
        <div className="text-sm font-semibold">Upsert mapping</div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <div className="font-medium">WHMCS Product ID</div>
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={whmcsProductId} onChange={(e) => setWhmcsProductId(e.target.value)} />
          </label>
          <label className="block text-sm">
            <div className="font-medium">Provider ID</div>
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={providerId} onChange={(e) => setProviderId(e.target.value)} />
          </label>
          <label className="block text-sm">
            <div className="font-medium">Credential ID</div>
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={credentialId} onChange={(e) => setCredentialId(e.target.value)} />
          </label>
          <label className="block text-sm md:col-span-2">
            <div className="font-medium">planRef (JSON)</div>
            <textarea className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-xs" rows={5} value={planRefJson} onChange={(e) => setPlanRefJson(e.target.value)} />
          </label>
        </div>
        <button className="mt-3 rounded-md bg-black px-3 py-2 text-sm text-white" onClick={upsert}>
          Save mapping
        </button>
      </div>

      <div className="mt-6 rounded-lg border">
        <div className="border-b p-4 text-sm font-semibold">Existing mappings</div>
        <div className="divide-y">
          {mappings.map((m) => (
            <div key={m.id} className="p-4 text-sm">
              <div className="font-medium">WHMCS product #{m.whmcsProductId}</div>
              <div className="text-gray-600">Provider: {m.providerId}</div>
              <div className="text-gray-600">Credential: {m.credentialId}</div>
              <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">{JSON.stringify(m.planRef, null, 2)}</pre>
            </div>
          ))}
          {mappings.length === 0 ? <div className="p-4 text-sm text-gray-600">No mappings yet.</div> : null}
        </div>
      </div>
    </div>
  );
}


