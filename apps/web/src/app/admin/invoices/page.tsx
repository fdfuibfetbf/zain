'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { DataTable, StatusBadge, formatDate, formatCurrency, getStatusColor, Pagination, Select, PageHeader, Card, ErrorAlert, SearchInput } from '../components/DataTable';
import { useDebounce } from '../hooks/useDebounce';

type Invoice = {
  id: string;
  invoicenum: string;
  userid: string;
  date: string;
  duedate: string;
  status: string;
  total: string;
  currency: string;
  paymentmethod?: string;
};

// Icons
const Icons = {
  Refresh: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  ),
  Invoice: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  CreditCard: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  DollarSign: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
};

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Unpaid', label: 'Unpaid' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Refunded', label: 'Refunded' },
  { value: 'Collections', label: 'Collections' },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 25;

  useEffect(() => {
    setPage(0);
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    loadInvoices();
  }, [page, statusFilter]);

  async function loadInvoices() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limitstart: String(page * limit),
        limitnum: String(limit),
      });
      if (statusFilter) params.append('status', statusFilter);

      const data = await apiFetch<{ invoices: Invoice[]; totalresults: number }>(
        `/admin/whmcs/invoices?${params.toString()}`
      );
      setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
      setTotalResults(data.totalresults || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }

  // Local filtering by search
  const filteredInvoices = debouncedSearch
    ? invoices.filter(inv => 
        inv.invoicenum?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        inv.userid?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : invoices;

  const columns = [
    {
      key: 'invoicenum',
      label: 'Invoice',
      sortable: true,
      render: (invoice: Invoice) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Icons.Invoice />
          </div>
          <div>
            <div className="font-mono font-semibold text-[var(--accent-primary)]">#{invoice.invoicenum || invoice.id}</div>
            <div className="text-xs text-[var(--foreground-subtle)]">Client: #{invoice.userid}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Created',
      sortable: true,
      render: (invoice: Invoice) => (
        <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
          <Icons.Calendar />
          <span className="text-sm">{formatDate(invoice.date)}</span>
        </div>
      ),
    },
    {
      key: 'duedate',
      label: 'Due Date',
      sortable: true,
      render: (invoice: Invoice) => {
        const dueDate = new Date(invoice.duedate);
        const now = new Date();
        const isOverdue = dueDate < now && invoice.status?.toLowerCase() === 'unpaid';
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <div>
            <div className={`flex items-center gap-2 ${isOverdue ? 'text-[var(--error)]' : 'text-[var(--foreground-muted)]'}`}>
              <Icons.Clock />
              <span className="text-sm">{formatDate(invoice.duedate)}</span>
            </div>
            {invoice.status?.toLowerCase() === 'unpaid' && (
              <div className={`text-xs mt-0.5 ${isOverdue ? 'text-[var(--error)]' : daysUntilDue <= 7 ? 'text-[var(--warning)]' : 'text-[var(--foreground-subtle)]'}`}>
                {isOverdue ? 'Overdue!' : daysUntilDue <= 7 ? `${daysUntilDue} days left` : ''}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'total',
      label: 'Amount',
      sortable: true,
      render: (invoice: Invoice) => (
        <span className="font-semibold text-white text-lg">{formatCurrency(invoice.total, invoice.currency)}</span>
      ),
    },
    {
      key: 'paymentmethod',
      label: 'Payment',
      render: (invoice: Invoice) => (
        invoice.paymentmethod ? (
          <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
            <Icons.CreditCard />
            <span className="text-sm capitalize">{invoice.paymentmethod}</span>
          </div>
        ) : (
          <span className="text-[var(--foreground-subtle)]">—</span>
        )
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (invoice: Invoice) => <StatusBadge status={invoice.status} getStatusColor={getStatusColor} />,
    },
  ];

  // Stats calculations
  const paidCount = invoices.filter(inv => inv.status?.toLowerCase() === 'paid').length;
  const unpaidCount = invoices.filter(inv => inv.status?.toLowerCase() === 'unpaid').length;
  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

  const stats = [
    { 
      label: 'Total Invoices', 
      value: totalResults.toLocaleString(), 
      color: 'from-orange-500/20 to-amber-500/10',
      icon: Icons.Invoice
    },
    { 
      label: 'Paid', 
      value: paidCount.toString(), 
      color: 'from-emerald-500/20 to-teal-500/10',
      icon: Icons.Check
    },
    { 
      label: 'Unpaid', 
      value: unpaidCount.toString(), 
      color: 'from-red-500/20 to-rose-500/10',
      icon: Icons.Warning
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="View and manage all WHMCS invoices"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary ${showFilters ? 'bg-[var(--surface-3)] border-[var(--border-accent)]' : ''}`}
            >
              <Icons.Filter />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button onClick={loadInvoices} disabled={loading} className="btn-secondary">
              <Icons.Refresh />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div 
            key={stat.label}
            className={`surface-card p-4 flex items-center gap-4 opacity-0 animate-fade-in`}
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-[var(--foreground-muted)]`}>
              <stat.icon />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-[var(--foreground-muted)]">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <Card padding="md" className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by invoice number or client ID..."
            className="flex-1"
          />
          
          <div className={`flex flex-col sm:flex-row gap-4 ${showFilters ? '' : 'hidden lg:flex'}`}>
            <Select
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(0);
              }}
              options={statusOptions}
              placeholder="All Status"
              className="sm:w-44"
            />
          </div>
        </div>

        {/* Active filters */}
        {(debouncedSearch || statusFilter) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <span className="text-xs text-[var(--foreground-subtle)]">Active filters:</span>
            {debouncedSearch && (
              <span className="badge badge-info flex items-center gap-1">
                Search: {debouncedSearch}
                <button onClick={() => setSearch('')} className="ml-1 hover:text-white">×</button>
              </span>
            )}
            {statusFilter && (
              <span className="badge badge-info flex items-center gap-1">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('')} className="ml-1 hover:text-white">×</button>
              </span>
            )}
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); }}
              className="text-xs text-[var(--accent-primary)] hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </Card>

      {/* Error State */}
      {error && <ErrorAlert message={error} onRetry={loadInvoices} />}

      {/* Data Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-6">
          <DataTable
            data={filteredInvoices}
            columns={columns}
            getRowKey={(invoice) => invoice.id}
            emptyMessage="No invoices found"
            emptyDescription="Try adjusting your filter criteria."
            isLoading={loading && invoices.length === 0}
          />

          {/* Pagination */}
          {!loading && filteredInvoices.length > 0 && (
            <Pagination
              currentPage={page}
              totalItems={totalResults}
              itemsPerPage={limit}
              onPageChange={setPage}
              isLoading={loading}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
