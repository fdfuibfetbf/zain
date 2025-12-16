'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { DataTable, StatusBadge, formatDate, formatCurrency, getStatusColor, Pagination, SearchInput, Select, PageHeader, Card, ErrorAlert } from '../components/DataTable';

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
  Server: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  Cpu: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  Activity: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
    </svg>
  ),
};

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'Active', label: 'Active' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Terminated', label: 'Terminated' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 25;

  useEffect(() => {
    setPage(0);
  }, [statusFilter, search]);

  useEffect(() => {
    loadServices();
  }, [page, statusFilter]);

  async function loadServices() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limitstart: String(page * limit),
        limitnum: String(limit),
      });
      if (statusFilter) params.append('status', statusFilter);

      const data = await apiFetch<{ services: Service[]; totalresults: number }>(
        `/admin/whmcs/services?${params.toString()}`
      );
      setServices(Array.isArray(data.services) ? data.services : []);
      setTotalResults(data.totalresults || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  // Filter by search locally (since the API might not support search)
  const filteredServices = search
    ? services.filter(s => 
        s.product?.toLowerCase().includes(search.toLowerCase()) ||
        s.domain?.toLowerCase().includes(search.toLowerCase())
      )
    : services;

  const columns = [
    {
      key: 'product',
      label: 'Service',
      sortable: true,
      render: (service: Service) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center flex-shrink-0">
            <Icons.Cpu />
          </div>
          <div>
            <div className="font-semibold text-white">{service.product || 'N/A'}</div>
            <div className="text-xs text-[var(--foreground-subtle)]">ID: {service.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'domain',
      label: 'Domain',
      sortable: true,
      render: (service: Service) => (
        <div className="flex items-center gap-2">
          <Icons.Globe />
          <span className="font-mono text-[var(--accent-primary)]">{service.domain || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (service: Service) => <StatusBadge status={service.status} getStatusColor={getStatusColor} />,
    },
    {
      key: 'server',
      label: 'Server',
      render: (service: Service) =>
        service.server ? (
          <div className="space-y-1">
            {service.server.ip && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--success)] shadow-[0_0_6px_var(--success)]"></span>
                <span className="font-mono text-sm text-white">{service.server.ip}</span>
              </div>
            )}
            <StatusBadge status={service.server.status} getStatusColor={getStatusColor} />
          </div>
        ) : (
          <span className="text-[var(--foreground-subtle)] text-sm italic flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--foreground-subtle)]"></span>
            Not provisioned
          </span>
        ),
    },
    {
      key: 'nextduedate',
      label: 'Next Due',
      sortable: true,
      render: (service: Service) => {
        const dueDate = service.nextduedate;
        if (!dueDate) return <span className="text-[var(--foreground-subtle)]">—</span>;
        
        const date = new Date(dueDate);
        const now = new Date();
        const daysUntilDue = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <div className="flex items-center gap-2">
            <Icons.Calendar />
            <div>
              <div className="text-sm text-[var(--foreground-muted)]">{formatDate(dueDate)}</div>
              {daysUntilDue <= 7 && daysUntilDue > 0 && (
                <div className="text-xs text-[var(--warning)]">{daysUntilDue} days left</div>
              )}
              {daysUntilDue <= 0 && (
                <div className="text-xs text-[var(--error)]">Overdue</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (service: Service) => (
        <span className="font-semibold text-white">{formatCurrency(service.amount, service.currency)}</span>
      ),
    },
  ];

  // Stats calculations
  const activeCount = services.filter(s => s.status?.toLowerCase() === 'active').length;
  const provisionedCount = services.filter(s => s.server).length;
  const totalRevenue = services.reduce((sum, s) => sum + parseFloat(s.amount || '0'), 0);

  const stats = [
    { 
      label: 'Total Services', 
      value: totalResults.toLocaleString(), 
      color: 'from-blue-500/20 to-cyan-500/10',
      icon: Icons.Server
    },
    { 
      label: 'Active', 
      value: activeCount.toString(), 
      color: 'from-emerald-500/20 to-teal-500/10',
      icon: Icons.Activity
    },
    { 
      label: 'Provisioned', 
      value: provisionedCount.toString(), 
      color: 'from-purple-500/20 to-pink-500/10',
      icon: Icons.Cpu
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Manage all WHMCS services and server provisioning"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary ${showFilters ? 'bg-[var(--surface-3)] border-[var(--border-accent)]' : ''}`}
            >
              <Icons.Filter />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button onClick={loadServices} disabled={loading} className="btn-secondary">
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
            placeholder="Search by product name or domain..."
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
        {(search || statusFilter) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <span className="text-xs text-[var(--foreground-subtle)]">Active filters:</span>
            {search && (
              <span className="badge badge-info flex items-center gap-1">
                Search: {search}
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
      {error && <ErrorAlert message={error} onRetry={loadServices} />}

      {/* Data Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-6">
          <DataTable
            data={filteredServices}
            columns={columns}
            getRowKey={(service) => service.id}
            emptyMessage="No services found"
            emptyDescription="Try adjusting your filter criteria."
            isLoading={loading && services.length === 0}
          />

          {/* Pagination */}
          {!loading && filteredServices.length > 0 && (
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
