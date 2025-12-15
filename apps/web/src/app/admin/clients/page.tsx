'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { DataTable, StatusBadge, formatDate, getStatusColor } from '../components/DataTable';
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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 50;

  useEffect(() => {
    setPage(0); // Reset to first page when search changes
  }, [debouncedSearch]);

  useEffect(() => {
    loadClients();
  }, [page, debouncedSearch]);

  async function loadClients() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limitstart: String(page * limit),
        limitnum: String(limit),
      });
      if (debouncedSearch) params.append('search', debouncedSearch);

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
      label: 'Name',
      render: (client: Client) => (
        <div>
          <div className="font-medium text-[#f0f6fc]">
            {`${client.firstname || ''} ${client.lastname || ''}`.trim() || 'N/A'}
          </div>
          {client.companyname && (
            <div className="text-xs text-[#8b949e] mt-0.5">{client.companyname}</div>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (client: Client) => (
        <a href={`mailto:${client.email}`} className="text-[#58a6ff] hover:underline">
          {client.email || 'N/A'}
        </a>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (client: Client) => client.phone || '—',
    },
    {
      key: 'location',
      label: 'Location',
      render: (client: Client) => {
        const parts = [client.city, client.state, client.country].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : '—';
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (client: Client) => <StatusBadge status={client.status} getStatusColor={getStatusColor} />,
    },
    {
      key: 'datecreated',
      label: 'Created',
      render: (client: Client) => formatDate(client.datecreated),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f0f6fc] mb-2">Clients</h1>
        <p className="text-[#8b949e]">Manage all WHMCS clients and user accounts</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search clients by name, email, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] placeholder-[#6e7681] focus:outline-none focus:ring-2 focus:ring-[#58a6ff] focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-[#8b949e]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button
            onClick={loadClients}
            disabled={loading}
            className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[#c9d1d9] hover:bg-[#30363d] transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-red-400 font-medium">Error loading clients</p>
            <p className="text-sm text-red-300/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <div className="p-6">
          {loading && clients.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#58a6ff] mb-4"></div>
              <p className="text-[#8b949e]">Loading clients...</p>
            </div>
          ) : (
            <>
              <DataTable
                data={clients}
                columns={columns}
                getRowKey={(client) => client.id}
                emptyMessage="No clients found"
              />
              {/* Pagination */}
              {totalResults > 0 && (
                <div className="mt-4 flex items-center justify-between border-t border-[#30363d] pt-4">
                  <div className="text-sm text-[#8b949e]">
                    Showing {Math.min(page * limit + 1, totalResults)} to {Math.min((page + 1) * limit, totalResults)} of {totalResults} clients
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0 || loading}
                      className="px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-lg text-sm text-[#c9d1d9] hover:bg-[#30363d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={(page + 1) * limit >= totalResults || loading || totalResults === 0}
                      className="px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-lg text-sm text-[#c9d1d9] hover:bg-[#30363d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

