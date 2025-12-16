'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  FileText,
  RefreshCw,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Invoice = {
  id: string;
  invoicenum: string;
  date: string;
  duedate: string;
  status: string;
  total: string;
  currency: string;
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    setLoading(true);
    setError(null);
    try {
      // Note: This would need a panel endpoint for invoices
      // For now, showing empty state
      setInvoices([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'paid') {
      return 'badge-success';
    }
    if (statusLower === 'unpaid') {
      return 'badge-warning';
    }
    if (statusLower === 'overdue') {
      return 'badge-error';
    }
    if (statusLower === 'cancelled') {
      return 'badge-neutral';
    }
    return 'badge-neutral';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'paid') {
      return <CheckCircle className="w-4 h-4" />;
    }
    if (statusLower === 'unpaid') {
      return <Clock className="w-4 h-4" />;
    }
    if (statusLower === 'overdue') {
      return <AlertCircle className="w-4 h-4" />;
    }
    return <Clock className="w-4 h-4" />;
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48"></div>
        <div className="card p-6">
          <div className="skeleton h-64 w-full rounded-xl"></div>
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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Billing</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            View and manage your invoices and payment methods
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadInvoices} className="btn btn-secondary">
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
              <p className="text-sm text-[var(--error)] font-medium">Error loading invoices</p>
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
          { label: 'Total Invoices', value: invoices.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Paid', value: invoices.filter((i) => i.status === 'Paid').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Unpaid', value: invoices.filter((i) => i.status === 'Unpaid').length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Total Amount', value: formatCurrency(invoices.reduce((acc, i) => acc + parseFloat(i.total || '0'), 0).toString()), icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
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

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center">
            <FileText className="w-10 h-10 text-[var(--foreground-subtle)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No invoices found</h3>
          <p className="text-[var(--foreground-muted)]">
            Your invoices will appear here once they're available.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Invoices</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <td>
                      <span className="font-mono font-medium text-[var(--accent-primary)]">
                        #{invoice.invoicenum || invoice.id}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                        <Calendar className="w-4 h-4" />
                        {formatDate(invoice.date)}
                      </div>
                    </td>
                    <td>
                      <span className={`text-sm ${invoice.status === 'Overdue' ? 'text-[var(--error)] font-medium' : 'text-[var(--foreground-muted)]'}`}>
                        {formatDate(invoice.duedate)}
                      </span>
                    </td>
                    <td className="font-semibold text-[var(--foreground)]">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-icon btn-ghost btn-sm" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="btn-icon btn-ghost btn-sm" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

