'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { DataTable, StatusBadge, formatDate, getStatusColor, Pagination, SearchInput, Select, PageHeader, Card, ErrorAlert } from '../components/DataTable';
import { useDebounce } from '../hooks/useDebounce';

type Client = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  companyname?: string;
  status: string;
  datecreated: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
};

// Icons
const Icons = {
  Refresh: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  Export: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  Location: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
};

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Closed', label: 'Closed' },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 25;

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    loadClients();
  }, [page, debouncedSearch, statusFilter]);

  async function loadClients() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limitstart: String(page * limit),
        limitnum: String(limit),
      });
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (statusFilter) params.append('status', statusFilter);

      const data = await apiFetch<{ clients: Client[]; totalresults: number }>(
        `/admin/whmcs/clients?${params.toString()}`
      );
      setClients(Array.isArray(data.clients) ? data.clients : []);
      setTotalResults(data.totalresults || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Client',
      sortable: true,
      render: (client: Client) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {client.firstname?.charAt(0) || client.email?.charAt(0) || '?'}
          </div>
          <div>
            <div className="font-semibold text-white">
              {`${client.firstname || ''} ${client.lastname || ''}`.trim() || 'N/A'}
            </div>
            {client.companyname && (
              <div className="text-xs text-[var(--foreground-subtle)] flex items-center gap-1 mt-0.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {client.companyname}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      render: (client: Client) => (
        <div className="space-y-1">
          <a 
            href={`mailto:${client.email}`} 
            className="flex items-center gap-1.5 text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] transition-colors"
          >
            <Icons.Mail />
            <span className="text-sm">{client.email || 'N/A'}</span>
          </a>
          {client.phone && (
            <div className="flex items-center gap-1.5 text-[var(--foreground-muted)]">
              <Icons.Phone />
              <span className="text-sm">{client.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (client: Client) => {
        const parts = [client.city, client.state, client.country].filter(Boolean);
        if (parts.length === 0) return <span className="text-[var(--foreground-subtle)]">—</span>;
        return (
          <div className="flex items-center gap-1.5 text-[var(--foreground-muted)]">
            <Icons.Location />
            <span className="text-sm">{parts.join(', ')}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (client: Client) => <StatusBadge status={client.status} getStatusColor={getStatusColor} />,
    },
    {
      key: 'datecreated',
      label: 'Created',
      sortable: true,
      render: (client: Client) => (
        <span className="text-[var(--foreground-muted)] text-sm">{formatDate(client.datecreated)}</span>
      ),
    },
  ];

  // Stats cards data
  const stats = [
    { label: 'Total Clients', value: totalResults, color: 'from-blue-500/20 to-cyan-500/10' },
    { label: 'Active', value: clients.filter(c => c.status?.toLowerCase() === 'active').length, color: 'from-emerald-500/20 to-teal-500/10' },
    { label: 'This Page', value: clients.length, color: 'from-purple-500/20 to-pink-500/10' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage all WHMCS clients and user accounts"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary ${showFilters ? 'bg-[var(--surface-3)] border-[var(--border-accent)]' : ''}`}
            >
              <Icons.Filter />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button onClick={loadClients} disabled={loading} className="btn-secondary">
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
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
              <Icons.Users />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</div>
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
            placeholder="Search clients by name, email, or company..."
            className="flex-1"
          />
          
          {/* Responsive filter toggle */}
          <div className={`flex flex-col sm:flex-row gap-4 ${showFilters ? '' : 'hidden lg:flex'}`}>
            <Select
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(0);
              }}
              options={statusOptions}
              placeholder="All Status"
              className="sm:w-40"
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
      {error && <ErrorAlert message={error} onRetry={loadClients} />}

      {/* Data Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-6">
          <DataTable
            data={clients}
            columns={columns}
            getRowKey={(client) => client.id}
            emptyMessage="No clients found"
            emptyDescription="Try adjusting your search or filter criteria."
            isLoading={loading && clients.length === 0}
          />

          {/* Pagination */}
          {!loading && clients.length > 0 && (
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
