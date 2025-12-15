'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '@/lib/api';

type KmsKey = { id: string; provider: string; keyId: string; region?: string | null; purpose: string };

export default function AdminSetupPage() {
  const [kmsKeys, setKmsKeys] = useState<KmsKey[]>([]);
  const [selectedKmsKeyId, setSelectedKmsKeyId] = useState<string>('');

  const [kmsKeyId, setKmsKeyId] = useState('');
  const [kmsRegion, setKmsRegion] = useState('');

  const [adminGroupId, setAdminGroupId] = useState('');
  const [jwtKey, setJwtKey] = useState('');

  const [whmcsBaseUrl, setWhmcsBaseUrl] = useState('');
  const [whmcsIdentifier, setWhmcsIdentifier] = useState('');
  const [whmcsSecret, setWhmcsSecret] = useState('');

  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reloadKeys() {
    try {
      setError(null);
      const out = await apiFetch<{ keys: KmsKey[] }>('/admin/kms-keys');
      setKmsKeys(out.keys);
      if (!selectedKmsKeyId && out.keys[0]?.id) setSelectedKmsKeyId(out.keys[0].id);
    } catch (e) {
      // KMS keys list is admin-only; during bootstrap you may not have access yet.
    }
  }

  useEffect(() => {
    reloadKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function bootstrapCreateKmsKey() {
    setStatus(null);
    setError(null);
    try {
      const out = await apiFetch<{ key: KmsKey }>('/admin/kms-keys', {
        method: 'POST',
        body: JSON.stringify({ provider: 'aws', keyId: kmsKeyId, region: kmsRegion || undefined, purpose: 'envelope' }),
      });
      setStatus(`Created KMS key ${out.key.id}`);
      setSelectedKmsKeyId(out.key.id);
      await reloadKeys();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }

  async function bootstrapSetAdminGroup() {
    setStatus(null);
    setError(null);
    try {
      await apiFetch('/admin/app-config', {
        method: 'PUT',
        body: JSON.stringify({ adminClientGroupId: adminGroupId ? Number(adminGroupId) : null }),
      });
      setStatus('Saved admin client group id.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }

  async function bootstrapSetJwtKey() {
    setStatus(null);
    setError(null);
    try {
      if (!selectedKmsKeyId) throw new Error('Select a KMS key id first');
      await apiFetch('/admin/jwt-signing-key', {
        method: 'PUT',
        body: JSON.stringify({ jwtSigningKey: jwtKey, kmsKeyId: selectedKmsKeyId }),
      });
      setStatus('JWT signing key saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }

  async function bootstrapConnectWhmcs() {
    setStatus(null);
    setError(null);
    try {
      if (!selectedKmsKeyId) throw new Error('Select a KMS key id first');
      await apiFetch('/admin/whmcs', {
        method: 'PUT',
        body: JSON.stringify({
          baseUrl: whmcsBaseUrl,
          apiIdentifier: whmcsIdentifier,
          apiSecret: whmcsSecret,
          kmsKeyId: selectedKmsKeyId,
        }),
      });
      setStatus('WHMCS connection saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Setup</h1>
      <p className="mt-1 text-sm text-gray-600">
        Bootstrap is allowed only from localhost and only until an admin WHMCS client group is set.
      </p>

      {status ? <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm">{status}</div> : null}
      {error ? <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm">{error}</div> : null}

      <div className="mt-6 space-y-6">
        <section className="rounded-lg border p-4">
          <h2 className="text-sm font-semibold">1) Create KMS key record (AWS)</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="block text-sm">
              <div className="font-medium">KMS KeyId/ARN</div>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={kmsKeyId} onChange={(e) => setKmsKeyId(e.target.value)} />
            </label>
            <label className="block text-sm">
              <div className="font-medium">Region</div>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={kmsRegion} onChange={(e) => setKmsRegion(e.target.value)} />
            </label>
          </div>
          <button className="mt-3 rounded-md bg-black px-3 py-2 text-sm text-white" onClick={bootstrapCreateKmsKey}>
            Create KMS key record
          </button>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="text-sm font-semibold">2) Select KMS key</h2>
          <select
            className="mt-3 w-full rounded-md border px-3 py-2 text-sm"
            value={selectedKmsKeyId}
            onChange={(e) => setSelectedKmsKeyId(e.target.value)}
          >
            <option value="">Select…</option>
            {kmsKeys.map((k) => (
              <option key={k.id} value={k.id}>
                {k.provider}:{k.keyId} ({k.id})
              </option>
            ))}
          </select>
          <div className="mt-2 text-xs text-gray-600">If this list is empty, create one above.</div>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="text-sm font-semibold">3) Set WHMCS Admin Client Group ID</h2>
          <label className="mt-3 block text-sm">
            <div className="font-medium">adminClientGroupId</div>
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={adminGroupId} onChange={(e) => setAdminGroupId(e.target.value)} />
          </label>
          <button className="mt-3 rounded-md bg-black px-3 py-2 text-sm text-white" onClick={bootstrapSetAdminGroup}>
            Save admin group id
          </button>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="text-sm font-semibold">4) Set JWT signing key (stored encrypted)</h2>
          <label className="mt-3 block text-sm">
            <div className="font-medium">JWT signing key (min 16 chars)</div>
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={jwtKey} onChange={(e) => setJwtKey(e.target.value)} />
          </label>
          <button className="mt-3 rounded-md bg-black px-3 py-2 text-sm text-white" onClick={bootstrapSetJwtKey}>
            Save JWT key
          </button>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="text-sm font-semibold">5) Connect WHMCS (stored encrypted)</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="block text-sm">
              <div className="font-medium">Base URL</div>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={whmcsBaseUrl} onChange={(e) => setWhmcsBaseUrl(e.target.value)} />
            </label>
            <label className="block text-sm">
              <div className="font-medium">API Identifier</div>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={whmcsIdentifier} onChange={(e) => setWhmcsIdentifier(e.target.value)} />
            </label>
            <label className="block text-sm md:col-span-2">
              <div className="font-medium">API Secret</div>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={whmcsSecret} onChange={(e) => setWhmcsSecret(e.target.value)} />
            </label>
          </div>
          <button className="mt-3 rounded-md bg-black px-3 py-2 text-sm text-white" onClick={bootstrapConnectWhmcs}>
            Save WHMCS connection
          </button>
        </section>
      </div>
    </div>
  );
}


