'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  Lock,
  Users,
  Cloud,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Shield,
  Settings,
} from 'lucide-react';
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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const out = await apiFetch<{ key: KmsKey }>('/admin/kms-keys', {
        method: 'POST',
        body: JSON.stringify({ provider: 'aws', keyId: kmsKeyId, region: kmsRegion || undefined, purpose: 'envelope' }),
      });
      setStatus(`Created KMS key ${out.key.id}`);
      setSelectedKmsKeyId(out.key.id);
      setKmsKeyId('');
      setKmsRegion('');
      await reloadKeys();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create KMS key');
    } finally {
      setLoading(false);
    }
  }

  async function bootstrapSetAdminGroup() {
    setStatus(null);
    setError(null);
    setLoading(true);
    try {
      await apiFetch('/admin/app-config', {
        method: 'PUT',
        body: JSON.stringify({ adminClientGroupId: adminGroupId ? Number(adminGroupId) : null }),
      });
      setStatus('Saved admin client group id.');
      setAdminGroupId('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save admin group');
    } finally {
      setLoading(false);
    }
  }

  async function bootstrapSetJwtKey() {
    setStatus(null);
    setError(null);
    setLoading(true);
    try {
      if (!selectedKmsKeyId) throw new Error('Select a KMS key id first');
      await apiFetch('/admin/jwt-signing-key', {
        method: 'PUT',
        body: JSON.stringify({ jwtSigningKey: jwtKey, kmsKeyId: selectedKmsKeyId }),
      });
      setStatus('JWT signing key saved.');
      setJwtKey('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save JWT key');
    } finally {
      setLoading(false);
    }
  }

  async function bootstrapConnectWhmcs() {
    setStatus(null);
    setError(null);
    setLoading(true);
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
      setWhmcsBaseUrl('');
      setWhmcsIdentifier('');
      setWhmcsSecret('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save WHMCS connection');
    } finally {
      setLoading(false);
    }
  }

  const setupSteps = [
    { number: 1, title: 'Create KMS Key Record', icon: Key, color: 'text-blue-600', bg: 'bg-blue-50' },
    { number: 2, title: 'Select KMS Key', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
    { number: 3, title: 'Set Admin Group', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { number: 4, title: 'Set JWT Key', icon: Lock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { number: 5, title: 'Connect WHMCS', icon: Cloud, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">System Setup</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            Bootstrap configuration (localhost only, until admin group is set)
          </p>
        </div>
      </motion.div>

      {/* Status Messages */}
      {status && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-[var(--success-soft)] border border-[var(--success)]/30"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--success)]">{status}</p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-[var(--error-soft)] border border-[var(--error)]/30"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--error)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--error)]">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Setup Steps */}
      <div className="space-y-6">
        {/* Step 1: Create KMS Key */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${setupSteps[0].bg} flex items-center justify-center`}>
                <setupSteps[0].icon className={`w-5 h-5 ${setupSteps[0].color}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {setupSteps[0].number}) {setupSteps[0].title} (AWS)
                </h3>
                <p className="text-sm text-[var(--foreground-muted)]">Create a new KMS key record for encryption</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  KMS KeyId/ARN
                </label>
                <input
                  type="text"
                  value={kmsKeyId}
                  onChange={(e) => setKmsKeyId(e.target.value)}
                  placeholder="arn:aws:kms:..."
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Region
                </label>
                <input
                  type="text"
                  value={kmsRegion}
                  onChange={(e) => setKmsRegion(e.target.value)}
                  placeholder="us-east-1"
                  className="input w-full"
                />
              </div>
            </div>
            <button
              onClick={bootstrapCreateKmsKey}
              disabled={loading || !kmsKeyId}
              className="btn btn-primary mt-4"
            >
              <Key className="w-4 h-4" />
              Create KMS Key Record
            </button>
          </div>
        </motion.div>

        {/* Step 2: Select KMS Key */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${setupSteps[1].bg} flex items-center justify-center`}>
                <setupSteps[1].icon className={`w-5 h-5 ${setupSteps[1].color}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {setupSteps[1].number}) {setupSteps[1].title}
                </h3>
                <p className="text-sm text-[var(--foreground-muted)]">Choose the KMS key for encryption operations</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <select
              value={selectedKmsKeyId}
              onChange={(e) => setSelectedKmsKeyId(e.target.value)}
              className="input w-full"
            >
              <option value="">Select a KMS key...</option>
              {kmsKeys.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.provider}:{k.keyId} {k.region && `(${k.region})`} - {k.id}
                </option>
              ))}
            </select>
            {kmsKeys.length === 0 && (
              <p className="text-sm text-[var(--foreground-muted)] mt-2">
                No KMS keys found. Create one in step 1 above.
              </p>
            )}
          </div>
        </motion.div>

        {/* Step 3: Set Admin Group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${setupSteps[2].bg} flex items-center justify-center`}>
                <setupSteps[2].icon className={`w-5 h-5 ${setupSteps[2].color}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {setupSteps[2].number}) {setupSteps[2].title}
                </h3>
                <p className="text-sm text-[var(--foreground-muted)]">Configure the WHMCS admin client group ID</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Admin Client Group ID
              </label>
              <input
                type="number"
                value={adminGroupId}
                onChange={(e) => setAdminGroupId(e.target.value)}
                placeholder="1"
                className="input w-full"
              />
            </div>
            <button
              onClick={bootstrapSetAdminGroup}
              disabled={loading || !adminGroupId}
              className="btn btn-primary mt-4"
            >
              <Users className="w-4 h-4" />
              Save Admin Group ID
            </button>
          </div>
        </motion.div>

        {/* Step 4: Set JWT Key */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${setupSteps[3].bg} flex items-center justify-center`}>
                <setupSteps[3].icon className={`w-5 h-5 ${setupSteps[3].color}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {setupSteps[3].number}) {setupSteps[3].title} (Encrypted)
                </h3>
                <p className="text-sm text-[var(--foreground-muted)]">Set the JWT signing key (minimum 16 characters)</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                JWT Signing Key
              </label>
              <input
                type="password"
                value={jwtKey}
                onChange={(e) => setJwtKey(e.target.value)}
                placeholder="Enter JWT signing key (min 16 chars)"
                className="input w-full"
                minLength={16}
              />
            </div>
            <button
              onClick={bootstrapSetJwtKey}
              disabled={loading || !jwtKey || jwtKey.length < 16 || !selectedKmsKeyId}
              className="btn btn-primary mt-4"
            >
              <Lock className="w-4 h-4" />
              Save JWT Key
            </button>
          </div>
        </motion.div>

        {/* Step 5: Connect WHMCS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${setupSteps[4].bg} flex items-center justify-center`}>
                <setupSteps[4].icon className={`w-5 h-5 ${setupSteps[4].color}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {setupSteps[4].number}) {setupSteps[4].title} (Encrypted)
                </h3>
                <p className="text-sm text-[var(--foreground-muted)]">Configure WHMCS API connection</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Base URL
                </label>
                <input
                  type="url"
                  value={whmcsBaseUrl}
                  onChange={(e) => setWhmcsBaseUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  API Identifier
                </label>
                <input
                  type="text"
                  value={whmcsIdentifier}
                  onChange={(e) => setWhmcsIdentifier(e.target.value)}
                  placeholder="API identifier"
                  className="input w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  API Secret
                </label>
                <input
                  type="password"
                  value={whmcsSecret}
                  onChange={(e) => setWhmcsSecret(e.target.value)}
                  placeholder="API secret"
                  className="input w-full"
                />
              </div>
            </div>
            <button
              onClick={bootstrapConnectWhmcs}
              disabled={loading || !whmcsBaseUrl || !whmcsIdentifier || !whmcsSecret || !selectedKmsKeyId}
              className="btn btn-primary mt-4"
            >
              <Cloud className="w-4 h-4" />
              Save WHMCS Connection
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


