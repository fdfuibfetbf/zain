'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Link2,
  Plus,
  RefreshCw,
  Code,
  Server,
  Key,
  FileText,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Mapping = { id: string; whmcsProductId: number; providerId: string; credentialId: string; planRef: any };

export default function ProductMappingsPage() {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [whmcsProductId, setWhmcsProductId] = useState('');
  const [providerId, setProviderId] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [planRefJson, setPlanRefJson] = useState('{\n  "region": "fsn1",\n  "size": "small"\n}');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const out = await apiFetch<{ mappings: Mapping[] }>('/admin/product-mappings');
      setMappings(out.mappings);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load mappings');
    } finally {
      setLoading(false);
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
      setWhmcsProductId('');
      setProviderId('');
      setCredentialId('');
      setPlanRefJson('{\n  "region": "fsn1",\n  "size": "small"\n}');
      setShowCreateForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save mapping');
    }
  }

  if (loading && mappings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48"></div>
        <div className="card p-6">
          <div className="skeleton h-64 w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Product Mappings</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            Map WHMCS product IDs to provider configurations and plan references
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="btn btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Mapping
          </button>
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-[var(--error-soft)] border border-[var(--error)]/30"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--error)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--error)]">Error</p>
              <p className="text-sm text-[var(--error)]/80 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Create Mapping Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--info-soft)] flex items-center justify-center">
                <Link2 className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Create Product Mapping</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Map a WHMCS product to a provider configuration</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  WHMCS Product ID
                </label>
                <input
                  type="number"
                  value={whmcsProductId}
                  onChange={(e) => setWhmcsProductId(e.target.value)}
                  placeholder="1"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Provider ID
                </label>
                <input
                  type="text"
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                  placeholder="provider-id"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Credential ID
                </label>
                <input
                  type="text"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  placeholder="credential-id"
                  className="input w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Plan Reference (JSON)
                </label>
                <textarea
                  value={planRefJson}
                  onChange={(e) => setPlanRefJson(e.target.value)}
                  rows={8}
                  className="input w-full font-mono text-sm"
                  placeholder='{\n  "region": "fsn1",\n  "size": "small"\n}'
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={upsert}
                disabled={!whmcsProductId || !providerId || !credentialId || !planRefJson}
                className="btn btn-primary"
              >
                <CheckCircle className="w-4 h-4" />
                Save Mapping
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setError(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { label: 'Total Mappings', value: mappings.length, icon: Link2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Unique Providers', value: new Set(mappings.map((m) => m.providerId)).size, icon: Server, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Unique Credentials', value: new Set(mappings.map((m) => m.credentialId)).size, icon: Key, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Mappings List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Existing Mappings</h3>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">
                {mappings.length} mapping{mappings.length !== 1 ? 's' : ''} configured
              </p>
            </div>
          </div>
        </div>
        <div className="card-body">
          {mappings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center">
                <Link2 className="w-10 h-10 text-[var(--foreground-subtle)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No mappings yet</h3>
              <p className="text-[var(--foreground-muted)] mb-6">
                Create your first product mapping to get started
              </p>
              <button onClick={() => setShowCreateForm(true)} className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Add Mapping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {mappings.map((mapping, index) => (
                <motion.div
                  key={mapping.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="card card-interactive p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--info-soft)] flex items-center justify-center">
                        <Link2 className="w-5 h-5 text-[var(--accent-primary)]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[var(--foreground)]">
                          WHMCS Product #{mapping.whmcsProductId}
                        </h4>
                        <p className="text-sm text-[var(--foreground-muted)]">Mapping ID: {mapping.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-ghost btn-sm">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="btn btn-ghost btn-sm text-[var(--error)]">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-2)]">
                      <Server className="w-5 h-5 text-[var(--foreground-subtle)]" />
                      <div>
                        <p className="text-xs text-[var(--foreground-subtle)]">Provider</p>
                        <p className="text-sm font-medium text-[var(--foreground)]">{mapping.providerId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-2)]">
                      <Key className="w-5 h-5 text-[var(--foreground-subtle)]" />
                      <div>
                        <p className="text-xs text-[var(--foreground-subtle)]">Credential</p>
                        <p className="text-sm font-medium text-[var(--foreground)]">{mapping.credentialId}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[var(--surface-2)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-[var(--foreground-subtle)]" />
                      <p className="text-xs font-medium text-[var(--foreground-subtle)]">Plan Reference</p>
                    </div>
                    <pre className="text-xs font-mono text-[var(--foreground-muted)] overflow-x-auto">
                      {JSON.stringify(mapping.planRef, null, 2)}
                    </pre>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}


