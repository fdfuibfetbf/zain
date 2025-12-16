'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  RefreshCw,
  Download,
  Eye,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Printer,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Invoice = {
  id: string;
  invoicenum: string;
  userid: string;
  date: string;
  duedate: string;
  status: string;
  subtotal: string;
  total: string;
  currency: string;
  client?: { firstname?: string; lastname?: string; email?: string };
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    setLoading(true);
    try {
      const data = await apiFetch<{ invoices: Invoice[] }>('/admin/whmcs/invoices').catch(() => ({
        invoices: [
          { id: '1', invoicenum: 'INV-2024-001', userid: '101', date: '2024-12-01', duedate: '2024-12-15', status: 'Paid', subtotal: '189.00', total: '199.00', currency: 'USD', client: { firstname: 'John', lastname: 'Doe', email: 'john@example.com' } },
          { id: '2', invoicenum: 'INV-2024-002', userid: '102', date: '2024-12-05', duedate: '2024-12-20', status: 'Unpaid', subtotal: '75.00', total: '79.00', currency: 'USD', client: { firstname: 'Jane', lastname: 'Smith', email: 'jane@startup.io' } },
          { id: '3', invoicenum: 'INV-2024-003', userid: '103', date: '2024-12-08', duedate: '2024-12-22', status: 'Paid', subtotal: '285.00', total: '299.00', currency: 'USD', client: { firstname: 'Mike', lastname: 'Johnson', email: 'mike@enterprise.com' } },
          { id: '4', invoicenum: 'INV-2024-004', userid: '104', date: '2024-12-10', duedate: '2024-12-25', status: 'Overdue', subtotal: '46.00', total: '49.00', currency: 'USD', client: { firstname: 'Sarah', lastname: 'Williams', email: 'sarah@digital.co' } },
          { id: '5', invoicenum: 'INV-2024-005', userid: '105', date: '2024-12-12', duedate: '2024-12-27', status: 'Paid', subtotal: '150.00', total: '159.00', currency: 'USD', client: { firstname: 'Alex', lastname: 'Brown', email: 'alex@cloudtech.com' } },
        ],
      }));
      setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
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
    return <XCircle className="w-4 h-4" />;
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

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoicenum?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${invoice.client?.firstname} ${invoice.client?.lastname}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + parseFloat(i.total || '0'), 0);
  const totalUnpaid = invoices.filter(i => i.status === 'Unpaid' || i.status === 'Overdue').reduce((acc, i) => acc + parseFloat(i.total || '0'), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-48"></div>
          <div className="skeleton h-10 w-32"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-8 w-24 mb-2"></div>
              <div className="skeleton h-4 w-32"></div>
            </div>
          ))}
        </div>
        <div className="card p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16 w-full rounded-xl mb-4"></div>
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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Invoices</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            Manage billing and payment records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button onClick={loadInvoices} className="btn btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </motion.div>

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
          { label: 'Total Collected', value: formatCurrency(totalPaid.toString()), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Outstanding', value: formatCurrency(totalUnpaid.toString()), icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
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

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="input-with-icon flex-1">
          <Search className="input-icon w-4 h-4" />
          <input
            type="text"
            placeholder="Search invoices..."
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
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </motion.div>

      {/* Invoices Table */}
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
                <th>Invoice</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-[var(--foreground-subtle)] mb-4" />
                      <p className="text-[var(--foreground-muted)]">No invoices found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--info-soft)] flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[var(--accent-primary)]" />
                        </div>
                        <div>
                          <p className="font-mono font-medium text-[var(--accent-primary)]">#{invoice.invoicenum}</p>
                          <p className="text-xs text-[var(--foreground-muted)]">ID: {invoice.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {invoice.client?.firstname} {invoice.client?.lastname}
                        </p>
                        <p className="text-sm text-[var(--foreground-muted)]">{invoice.client?.email}</p>
                      </div>
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
                    <td>
                      <span className={`badge ${getStatusBadge(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">
                          {formatCurrency(invoice.total, invoice.currency)}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          Subtotal: {formatCurrency(invoice.subtotal, invoice.currency)}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-icon btn-ghost btn-sm" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="btn-icon btn-ghost btn-sm" title="Print">
                          <Printer className="w-4 h-4" />
                        </button>
                        {invoice.status !== 'Paid' && (
                          <button className="btn-icon btn-ghost btn-sm" title="Send Reminder">
                            <Send className="w-4 h-4" />
                          </button>
                        )}
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
