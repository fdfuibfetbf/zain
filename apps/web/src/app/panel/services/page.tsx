'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  Server,
  Globe,
  RefreshCw,
  ChevronRight,
  Settings,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Service = {
  serviceId: number;
  productId: number;
  name: string;
  status: string;
  server: null | { status: string; ip?: string; providerResourceId: string };
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active') {
      return 'badge-success';
    }
    if (statusLower === 'suspended') {
      return 'badge-error';
    }
    if (statusLower === 'pending') {
      return 'badge-warning';
    }
    return 'badge-neutral';
  };

  const getServerStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'running':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-[var(--success)]" />;
      case 'stopped':
      case 'suspended':
        return <Clock className="w-4 h-4 text-[var(--foreground-subtle)]" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-[var(--error)]" />;
      default:
        return <Clock className="w-4 h-4 text-[var(--foreground-subtle)]" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-48"></div>
          <div className="skeleton h-10 w-32"></div>
        </div>
        <div className="card">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16 w-full rounded-xl"></div>
            ))}
          </div>
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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Services</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            Manage your active services and subscriptions
          </p>
        </div>
        <button onClick={loadServices} className="btn btn-secondary">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
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
              <p className="text-sm text-[var(--error)] font-medium">Error loading services</p>
              <p className="text-sm text-[var(--error)]/80 mt-1">{error}</p>
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
          { label: 'Total Services', value: services.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active', value: services.filter((s) => s.status === 'Active').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'With Servers', value: services.filter((s) => s.server).length, icon: Server, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Pending', value: services.filter((s) => s.status === 'Pending').length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
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

      {/* Services Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">All Services</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Service</th>
                <th>Status</th>
                <th>Server</th>
                <th>IP Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <Package className="w-12 h-12 text-[var(--foreground-subtle)] mb-4" />
                      <p className="text-[var(--foreground-muted)]">No services found</p>
                      <p className="text-sm text-[var(--foreground-subtle)] mt-1">
                        Your services will appear here once they're provisioned.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                services.map((service, index) => (
                  <motion.tr
                    key={service.serviceId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--info-soft)] flex items-center justify-center">
                          <Package className="w-5 h-5 text-[var(--accent-primary)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{service.name}</p>
                          <p className="text-xs text-[var(--foreground-muted)]">#{service.serviceId}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(service.status)}`}>
                        <span className="badge-dot"></span>
                        {service.status}
                      </span>
                    </td>
                    <td>
                      {service.server ? (
                        <div className="flex items-center gap-2">
                          {getServerStatusIcon(service.server.status)}
                          <span className="text-sm capitalize">{service.server.status}</span>
                        </div>
                      ) : (
                        <span className="text-[var(--foreground-subtle)] text-sm italic">Not provisioned</span>
                      )}
                    </td>
                    <td>
                      {service.server?.ip ? (
                        <span className="font-mono text-sm text-[var(--accent-primary)]">{service.server.ip}</span>
                      ) : (
                        <span className="text-[var(--foreground-subtle)] text-sm">—</span>
                      )}
                    </td>
                    <td>
                      {service.server ? (
                        <Link
                          href={`/panel/servers/${service.serviceId}`}
                          className="btn btn-ghost btn-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Manage
                        </Link>
                      ) : (
                        <span className="text-[var(--foreground-subtle)] text-sm">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
