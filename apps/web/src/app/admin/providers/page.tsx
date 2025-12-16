'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cloud,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Key,
  Settings,
  ExternalLink,
  Server,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Provider = { id: string; type: string; displayName: string; enabled: boolean };

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [type, setType] = useState('hetzner');
  const [displayName, setDisplayName] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const out = await apiFetch<{ providers: Provider[] }>('/admin/providers');
      setProviders(out.providers);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
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
      setShowCreateForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create provider');
    }
  }

  const getProviderIcon = (type: string) => {
    return <Cloud className="w-5 h-5" />;
  };

  const providerTypes = [
    { value: 'hetzner', label: 'Hetzner' },
    { value: 'contabo', label: 'Contabo' },
    { value: 'datawagon', label: 'DataWagon' },
    { value: 'digitalocean', label: 'DigitalOcean' },
    { value: 'vultr', label: 'Vultr' },
    { value: 'linode', label: 'Linode' },
  ];

  if (loading && providers.length === 0) {
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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Cloud Providers</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            Manage cloud infrastructure providers and their credentials
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
            Add Provider
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
            <XCircle className="w-5 h-5 text-[var(--error)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--error)]">Error</p>
              <p className="text-sm text-[var(--error)]/80 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Create Provider Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--info-soft)] flex items-center justify-center">
                <Plus className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Add New Provider</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Configure a new cloud provider</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Provider Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input w-full"
                >
                  {providerTypes.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={type.charAt(0).toUpperCase() + type.slice(1)}
                  className="input w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={createProvider} className="btn btn-primary">
                <Cloud className="w-4 h-4" />
                Create Provider
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setDisplayName('');
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

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Providers', value: providers.length, icon: Cloud, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Enabled', value: providers.filter((p) => p.enabled).length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Disabled', value: providers.filter((p) => !p.enabled).length, icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
          { label: 'Types', value: new Set(providers.map((p) => p.type)).size, icon: Server, color: 'text-purple-600', bg: 'bg-purple-50' },
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

      {/* Providers List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Existing Providers</h3>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">
                {providers.length} provider{providers.length !== 1 ? 's' : ''} configured
              </p>
            </div>
          </div>
        </div>
        <div className="card-body">
          {providers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center">
                <Cloud className="w-10 h-10 text-[var(--foreground-subtle)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No providers yet</h3>
              <p className="text-[var(--foreground-muted)] mb-6">
                Get started by adding your first cloud provider
              </p>
              <button onClick={() => setShowCreateForm(true)} className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Add Provider
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providers.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="card card-interactive p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--info-soft)] flex items-center justify-center">
                        {getProviderIcon(provider.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[var(--foreground)]">{provider.displayName}</h4>
                        <p className="text-sm text-[var(--foreground-muted)] capitalize">{provider.type}</p>
                      </div>
                    </div>
                    <span className={`badge ${provider.enabled ? 'badge-success' : 'badge-neutral'}`}>
                      <span className="badge-dot"></span>
                      {provider.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                      <span className="font-mono text-xs bg-[var(--surface-2)] px-2 py-1 rounded">
                        {provider.id}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border-subtle)]">
                      <p className="text-xs text-[var(--foreground-subtle)] mb-1">API Endpoint</p>
                      <code className="text-xs font-mono text-[var(--foreground-muted)] break-all">
                        POST /admin/providers/{provider.id}/credentials
                      </code>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <button className="btn btn-ghost btn-sm">
                      <Key className="w-4 h-4" />
                      Manage Credentials
                    </button>
                    <button className="btn btn-ghost btn-sm">
                      <Settings className="w-4 h-4" />
                    </button>
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


