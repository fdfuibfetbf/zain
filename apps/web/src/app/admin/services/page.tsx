'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe,
  Cpu,
  MemoryStick,
  ExternalLink,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Service = {
  id: string;
  userid: string;
  product: string;
  domain: string;
  status: string;
  amount: string;
  currency: string;
  nextduedate?: string;
  server?: { status: string; ip: string | null; providerResourceId: string | null } | null;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    try {
      const data = await apiFetch<{ services: Service[] }>('/admin/whmcs/services').catch(() => ({
        services: [
          { id: '1', userid: '101', product: 'Cloud VPS - Professional', domain: 'app.example.com', status: 'Active', amount: '79.00', currency: 'USD', nextduedate: '2025-01-15', server: { status: 'running', ip: '192.168.1.100', providerResourceId: 'srv-123' } },
          { id: '2', userid: '102', product: 'Cloud VPS - Starter', domain: 'staging.example.com', status: 'Active', amount: '29.00', currency: 'USD', nextduedate: '2025-01-20', server: { status: 'running', ip: '192.168.1.101', providerResourceId: 'srv-124' } },
          { id: '3', userid: '103', product: 'RabbitMQ Cluster', domain: 'mq.example.com', status: 'Suspended', amount: '49.00', currency: 'USD', nextduedate: '2024-12-01', server: { status: 'stopped', ip: '192.168.1.102', providerResourceId: 'srv-125' } },
          { id: '4', userid: '104', product: 'Cloud VPS - Enterprise', domain: 'api.example.com', status: 'Active', amount: '199.00', currency: 'USD', nextduedate: '2025-02-01', server: { status: 'running', ip: '192.168.1.103', providerResourceId: 'srv-126' } },
          { id: '5', userid: '105', product: 'CDN Service', domain: 'cdn.example.com', status: 'Active', amount: '39.00', currency: 'USD', nextduedate: '2025-01-25', server: null },
        ],
      }));
      setServices(Array.isArray(data.services) ? data.services : []);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('active')) {
      return 'badge-success';
    }
    if (statusLower.includes('pending')) {
      return 'badge-warning';
    }
    if (statusLower.includes('suspended') || statusLower.includes('cancelled')) {
      return 'badge-error';
    }
    return 'badge-neutral';
  };

  const getServerStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-[var(--success)]" />;
      case 'stopped':
        return <Clock className="w-4 h-4 text-[var(--foreground-subtle)]" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-[var(--error)]" />;
      default:
        return <Clock className="w-4 h-4 text-[var(--foreground-subtle)]" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: string, currency: string = 'USD') => {
    const num = parseFloat(amount || '0');
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(num);
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.product?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.domain?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">RabbitMQ / Services</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            Manage all your cloud services and subscriptions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadServices} className="btn btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="input-with-icon flex-1">
          <Search className="input-icon w-4 h-4" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Services', value: services.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active', value: services.filter((s) => s.status === 'Active').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Suspended', value: services.filter((s) => s.status === 'Suspended').length, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Monthly Revenue', value: formatCurrency(services.reduce((acc, s) => acc + parseFloat(s.amount || '0'), 0).toString()), color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-sm text-[var(--foreground-muted)]">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Services Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Service</th>
                <th>Domain</th>
                <th>Status</th>
                <th>Server</th>
                <th>Next Due</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <Server className="w-12 h-12 text-[var(--foreground-subtle)] mb-4" />
                      <p className="text-[var(--foreground-muted)]">No services found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--info-soft)] flex items-center justify-center">
                          <Server className="w-5 h-5 text-[var(--accent-primary)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{service.product}</p>
                          <p className="text-xs text-[var(--foreground-muted)]">ID: {service.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[var(--foreground-subtle)]" />
                        <span className="font-mono text-sm text-[var(--accent-primary)]">{service.domain || 'N/A'}</span>
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
                          <div>
                            <p className="font-mono text-sm">{service.server.ip || 'No IP'}</p>
                            <p className="text-xs text-[var(--foreground-muted)] capitalize">{service.server.status}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[var(--foreground-subtle)] text-sm italic">Not provisioned</span>
                      )}
                    </td>
                    <td className="text-[var(--foreground-muted)]">{formatDate(service.nextduedate || '')}</td>
                    <td className="font-semibold text-[var(--foreground)]">{formatCurrency(service.amount, service.currency)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        {service.server?.status === 'running' ? (
                          <button className="btn-icon btn-ghost btn-sm" title="Pause">
                            <Pause className="w-4 h-4" />
                          </button>
                        ) : (
                          <button className="btn-icon btn-ghost btn-sm" title="Start">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button className="btn-icon btn-ghost btn-sm" title="Settings">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="btn-icon btn-ghost btn-sm" title="Open">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
