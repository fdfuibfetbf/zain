'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { DataTable, StatusBadge, formatDate, formatCurrency, getStatusColor, Pagination, Select, PageHeader, Card, ErrorAlert, SearchInput } from '../components/DataTable';
import { useDebounce } from '../hooks/useDebounce';

type Order = {
  id: string;
  ordernum: string;
  userid: string;
  date: string;
  status: string;
  amount: string;
  currency: string;
  paymentmethod?: string;
  client?: { firstname?: string; lastname?: string; email?: string };
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
  Orders: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
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
};

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Fraud', label: 'Fraud' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
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
    loadOrders();
  }, [page, statusFilter]);

  async function loadOrders() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limitstart: String(page * limit),
        limitnum: String(limit),
      });
      if (statusFilter) params.append('status', statusFilter);

      const data = await apiFetch<{ orders: Order[]; totalresults: number }>(
        `/admin/whmcs/orders?${params.toString()}`
      );
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setTotalResults(data.totalresults || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  // Local filtering by search
  const filteredOrders = debouncedSearch
    ? orders.filter(o => 
        o.ordernum?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        o.client?.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        `${o.client?.firstname} ${o.client?.lastname}`.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : orders;

  const columns = [
    {
      key: 'ordernum',
      label: 'Order',
      sortable: true,
      render: (order: Order) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center flex-shrink-0">
            <Icons.Orders />
          </div>
          <div>
            <div className="font-mono font-semibold text-[var(--accent-primary)]">#{order.ordernum || order.id}</div>
            <div className="text-xs text-[var(--foreground-subtle)]">ID: {order.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'client',
      label: 'Client',
      render: (order: Order) => (
        <div>
          <div className="font-medium text-white">
            {order.client
              ? `${order.client.firstname || ''} ${order.client.lastname || ''}`.trim() || 'N/A'
              : `User #${order.userid}`}
          </div>
          {order.client?.email && (
            <div className="text-xs text-[var(--foreground-subtle)]">{order.client.email}</div>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (order: Order) => (
        <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
          <Icons.Calendar />
          <span className="text-sm">{formatDate(order.date)}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (order: Order) => (
        <span className="font-semibold text-white text-lg">{formatCurrency(order.amount, order.currency)}</span>
      ),
    },
    {
      key: 'paymentmethod',
      label: 'Payment',
      render: (order: Order) => (
        order.paymentmethod ? (
          <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
            <Icons.CreditCard />
            <span className="text-sm capitalize">{order.paymentmethod}</span>
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
      render: (order: Order) => <StatusBadge status={order.status} getStatusColor={getStatusColor} />,
    },
  ];

  // Stats calculations
  const pendingCount = orders.filter(o => o.status?.toLowerCase() === 'pending').length;
  const completedCount = orders.filter(o => o.status?.toLowerCase() === 'active' || o.status?.toLowerCase() === 'completed').length;
  const totalAmount = orders.reduce((sum, o) => sum + parseFloat(o.amount || '0'), 0);

  const stats = [
    { 
      label: 'Total Orders', 
      value: totalResults.toLocaleString(), 
      color: 'from-blue-500/20 to-cyan-500/10',
      icon: Icons.Orders
    },
    { 
      label: 'Completed', 
      value: completedCount.toString(), 
      color: 'from-emerald-500/20 to-teal-500/10',
      icon: Icons.Check
    },
    { 
      label: 'Page Revenue', 
      value: formatCurrency(totalAmount.toString(), 'USD'), 
      color: 'from-purple-500/20 to-pink-500/10',
      icon: Icons.DollarSign
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="View and manage all WHMCS orders"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary ${showFilters ? 'bg-[var(--surface-3)] border-[var(--border-accent)]' : ''}`}
            >
              <Icons.Filter />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button onClick={loadOrders} disabled={loading} className="btn-secondary">
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
            placeholder="Search by order number, client name or email..."
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
      {error && <ErrorAlert message={error} onRetry={loadOrders} />}

      {/* Data Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-6">
          <DataTable
            data={filteredOrders}
            columns={columns}
            getRowKey={(order) => order.id}
            emptyMessage="No orders found"
            emptyDescription="Try adjusting your filter criteria."
            isLoading={loading && orders.length === 0}
          />

          {/* Pagination */}
          {!loading && filteredOrders.length > 0 && (
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
