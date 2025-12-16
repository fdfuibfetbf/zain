'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Server,
  RefreshCw,
  ChevronRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Service = {
  serviceId: number;
  productId: number;
  name: string;
  status: string;
  server: null | {
    status: string;
    ip?: string;
    providerResourceId: string;
  };
};

export default function ServersPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ services: Service[] }>('/panel/services');
      setServices(data.services || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load servers');
    } finally {
      setLoading(false);
    }
  }

  const filteredServices = services.filter((service) => {
    if (filter === 'all') return true;
    if (filter === 'active') return service.server?.status === 'active';
    if (filter === 'suspended') return service.server?.status === 'suspended';
    if (filter === 'pending') return service.server?.status === 'pending' || service.server?.status === 'provisioning';
    return true;
  });

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active' || statusLower === 'running') return 'badge-success';
    if (statusLower === 'suspended' || statusLower === 'stopped') return 'badge-error';
    if (statusLower === 'pending' || statusLower === 'provisioning') return 'badge-warning';
    if (statusLower === 'terminated' || statusLower === 'error') return 'badge-neutral';
    return 'badge-neutral';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-12 w-12 rounded-xl mb-4"></div>
              <div className="skeleton h-6 w-32 mb-2"></div>
              <div className="skeleton h-4 w-24"></div>
            </div>
          ))}
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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">VPS Servers</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            Manage and monitor your virtual private servers
          </p>
        </div>
        <button onClick={loadServices} className="btn btn-secondary">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-4"
      >
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'suspended', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-blue-500/20'
                  : 'bg-[var(--surface-2)] text-[var(--foreground-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
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
              <p className="text-sm text-[var(--error)] font-medium">Error loading servers</p>
              <p className="text-sm text-[var(--error)]/80 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Servers Grid */}
      {filteredServices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center">
            <Server className="w-10 h-10 text-[var(--foreground-subtle)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No servers found</h3>
          <p className="text-[var(--foreground-muted)]">
            Your VPS servers will appear here once they're provisioned.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.serviceId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link
                href={`/panel/servers/${service.serviceId}`}
                className="card card-interactive p-6 block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                      <Server className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        {service.name}
                      </h3>
                      <p className="text-sm text-[var(--foreground-muted)]">Service #{service.serviceId}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {service.server ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--foreground-muted)]">Server Status</span>
                        <span className={`badge ${getStatusColor(service.server.status)}`}>
                          <span className="badge-dot"></span>
                          {service.server.status}
                        </span>
                      </div>
                      {service.server.ip && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[var(--foreground-muted)]">IP Address</span>
                          <span className="text-sm font-mono text-[var(--accent-primary)]">{service.server.ip}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--foreground-muted)]">Service Status</span>
                        <span className={`badge ${getStatusColor(service.status)}`}>
                          <span className="badge-dot"></span>
                          {service.status}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center">
                      <span className="badge badge-warning">
                        <Clock className="w-3 h-3" />
                        Server not provisioned
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center text-sm text-[var(--accent-primary)]">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

