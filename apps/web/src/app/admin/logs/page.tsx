'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileSearch,
  Webhook,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Target,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { formatDateTime } from '../components/DataTable';

export default function LogsPage() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'audit' | 'webhooks'>('audit');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [a, w] = await Promise.all([
        apiFetch<{ logs: any[] }>('/admin/audit-logs?limit=50').catch(() => ({ logs: [] })),
        apiFetch<{ deliveries: any[] }>('/admin/webhook-deliveries?limit=50').catch(() => ({ deliveries: [] })),
      ]);
      setAuditLogs(a.logs || []);
      setWebhooks(w.deliveries || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }

  const getActionColor = (action: string) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return 'text-green-600 bg-green-50';
    }
    if (actionLower.includes('update') || actionLower.includes('modify')) {
      return 'text-blue-600 bg-blue-50';
    }
    if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return 'text-red-600 bg-red-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  if (loading && auditLogs.length === 0 && webhooks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="skeleton h-64 w-full"></div>
          </div>
          <div className="card p-6">
            <div className="skeleton h-64 w-full"></div>
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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Audit Logs</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            View system audit logs and WHMCS webhook deliveries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="btn btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
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

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Audit Logs', value: auditLogs.length, icon: FileSearch, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Webhook Deliveries', value: webhooks.length, icon: Webhook, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Verified Webhooks', value: webhooks.filter((w) => w.verified).length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Failed Webhooks', value: webhooks.filter((w) => !w.verified).length, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
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

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 border-b border-[var(--border-subtle)]"
      >
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'audit'
              ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
              : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileSearch className="w-4 h-4" />
            Audit Logs ({auditLogs.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'webhooks'
              ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
              : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            Webhook Deliveries ({webhooks.length})
          </div>
        </button>
      </motion.div>

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Audit Logs</h3>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">
                  System activity and user actions
                </p>
              </div>
            </div>
          </div>
          <div className="card-body">
            {auditLogs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center">
                  <FileSearch className="w-10 h-10 text-[var(--foreground-subtle)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No audit logs yet</h3>
                <p className="text-[var(--foreground-muted)]">Audit logs will appear here as system activity occurs</p>
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                          <Clock className="w-4 h-4" />
                          {formatDateTime(log.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[var(--foreground-subtle)]" />
                        <span className="text-[var(--foreground-muted)]">Actor:</span>
                        <span className="font-medium text-[var(--foreground)]">
                          {log.actorType}:{log.actorWhmcsId ?? 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-[var(--foreground-subtle)]" />
                        <span className="text-[var(--foreground-muted)]">Target:</span>
                        <span className="font-medium text-[var(--foreground)]">
                          {log.targetType}:{log.targetId ?? 'N/A'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Webhook Deliveries Tab */}
      {activeTab === 'webhooks' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Webhook Deliveries</h3>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">
                  WHMCS webhook events and delivery status
                </p>
              </div>
            </div>
          </div>
          <div className="card-body">
            {webhooks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center">
                  <Webhook className="w-10 h-10 text-[var(--foreground-subtle)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No webhook deliveries yet</h3>
                <p className="text-[var(--foreground-muted)]">Webhook deliveries will appear here when WHMCS sends events</p>
              </div>
            ) : (
              <div className="space-y-3">
                {webhooks.map((webhook, index) => (
                  <motion.div
                    key={webhook.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--info-soft)] text-[var(--accent-primary)]">
                          {webhook.event}
                        </span>
                        <span className={`badge ${webhook.verified ? 'badge-success' : 'badge-error'}`}>
                          <span className="badge-dot"></span>
                          {webhook.verified ? 'Verified' : 'Failed'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                        <Clock className="w-4 h-4" />
                        {formatDateTime(webhook.createdAt)}
                      </div>
                    </div>
                    {webhook.payload && (
                      <div className="mt-3 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border-subtle)]">
                        <pre className="text-xs font-mono text-[var(--foreground-muted)] overflow-x-auto">
                          {typeof webhook.payload === 'string' ? webhook.payload : JSON.stringify(webhook.payload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}


