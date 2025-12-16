'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Server,
  CheckCircle,
  FileText,
  Clock,
  RefreshCw,
  ChevronRight,
  Package,
  Globe,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Service = {
  serviceId: number;
  productId: number;
  name: string;
  status: string;
  server: null | { status: string; ip?: string; providerResourceId: string };
};

type Stats = {
  totalServices: number;
  activeServices: number;
  totalInvoices: number;
  pendingInvoices: number;
};

export default function PanelDashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [servicesData] = await Promise.all([
        apiFetch<{ services: Service[] }>('/panel/services').catch(() => ({ services: [] })),
      ]);

      setServices(servicesData.services || []);
      
      // Calculate stats
      const activeServices = servicesData.services?.filter((s) => s.status === 'Active').length || 0;
      setStats({
        totalServices: servicesData.services?.length || 0,
        activeServices,
        totalInvoices: 0,
        pendingInvoices: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-12 w-12 rounded-xl mb-4"></div>
              <div className="skeleton h-8 w-24 mb-2"></div>
              <div className="skeleton h-4 w-32"></div>
            </div>
          ))}
        </div>
        <div className="card p-6">
          <div className="skeleton h-64 w-full rounded-xl"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Services',
      value: stats?.totalServices ?? 0,
      icon: Package,
      trend: '+2',
      trendUp: true,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Active Services',
      value: stats?.activeServices ?? 0,
      icon: CheckCircle,
      trend: '+1',
      trendUp: true,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Total Invoices',
      value: stats?.totalInvoices ?? 0,
      icon: FileText,
      trend: '0',
      trendUp: true,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Pending Invoices',
      value: stats?.pendingInvoices ?? 0,
      icon: Clock,
      trend: '0',
      trendUp: false,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Overview</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            Welcome back! Here's what's happening with your services.
          </p>
        </div>
        <button onClick={loadData} className="btn btn-secondary">
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
            <svg className="w-5 h-5 text-[var(--error)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm text-[var(--error)] font-medium">Error loading data</p>
              <p className="text-sm text-[var(--error)]/80 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`stat-card-icon ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            <div className="stat-card-value">{card.value.toLocaleString()}</div>
            <div className="stat-card-label">{card.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Your Services</h3>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">Recent service activity</p>
            </div>
            <Link
              href="/panel/services"
              className="text-sm text-[var(--accent-primary)] font-medium hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="card-body">
          {services.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center">
                <Package className="w-10 h-10 text-[var(--foreground-subtle)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No services found</h3>
              <p className="text-[var(--foreground-muted)]">
                Your services will appear here once they're provisioned.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.slice(0, 5).map((service, index) => (
                <motion.div
                  key={service.serviceId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="card card-interactive p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-[var(--info-soft)] flex items-center justify-center">
                        <Server className="w-5 h-5 text-[var(--accent-primary)]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-[var(--foreground)]">{service.name}</h3>
                          <span className={`badge ${getStatusBadge(service.status)}`}>
                            <span className="badge-dot"></span>
                            {service.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]">
                          <span>Service #{service.serviceId}</span>
                          {service.server && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {service.server.ip || 'No IP'}
                              </span>
                              <span>•</span>
                              <span className="capitalize">{service.server.status}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/panel/services"
                      className="text-sm text-[var(--accent-primary)] font-medium hover:underline flex items-center gap-1"
                    >
                      Manage <ChevronRight className="w-4 h-4" />
                    </Link>
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
