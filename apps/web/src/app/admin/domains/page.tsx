'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { DataTable, StatusBadge, formatDate, formatCurrency, getStatusColor } from '../components/DataTable';

type Domain = {
  id: string;
  userid: string;
  domain: string;
  registrar: string;
  status: string;
  nextduedate?: string;
  amount?: string;
  currency?: string;
};

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 50;

  useEffect(() => {
    loadDomains();
  }, [page, statusFilter]);

  async function loadDomains() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limitstart: String(page * limit),
        limitnum: String(limit),
      });
      if (statusFilter) params.append('status', statusFilter);

      const data = await apiFetch<{ domains: Domain[]; totalresults: number }>(
        `/admin/whmcs/domains?${params.toString()}`
      );
      setDomains(Array.isArray(data.domains) ? data.domains : []);
      setTotalResults(data.totalresults || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load domains');
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      key: 'domain',
      label: 'Domain',
      render: (domain: Domain) => (
        <span className="font-mono font-medium text-[var(--accent-primary)]">{domain.domain || 'N/A'}</span>
      ),
    },
    {
      key: 'userid',
      label: 'Client ID',
      render: (domain: Domain) => <span className="font-mono text-[var(--foreground)]">#{domain.userid}</span>,
    },
    {
      key: 'registrar',
      label: 'Registrar',
      render: (domain: Domain) => domain.registrar || '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (domain: Domain) => <StatusBadge status={domain.status} getStatusColor={getStatusColor} />,
    },
    {
      key: 'nextduedate',
      label: 'Next Due',
      render: (domain: Domain) => formatDate(domain.nextduedate || ''),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (domain: Domain) =>
        domain.amount ? (
          <span className="font-medium">{formatCurrency(domain.amount, domain.currency)}</span>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-2">Domains</h1>
        <p className="text-[var(--foreground-muted)]">Manage all WHMCS domain registrations</p>
      </div>

      <div className="card p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="input w-full"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <button
            onClick={loadDomains}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="card p-4 bg-[var(--error-soft)] border border-[var(--error)]/30">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[var(--error)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm text-[var(--error)] font-medium">Error loading domains</p>
              <p className="text-sm text-[var(--error)]/80 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="p-6">
          {loading && domains.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)] mb-4"></div>
              <p className="text-[var(--foreground-muted)]">Loading domains...</p>
            </div>
          ) : (
            <>
              <DataTable
                data={domains}
                columns={columns}
                getRowKey={(domain) => domain.id}
                emptyMessage="No domains found"
              />
              {totalResults > 0 && (
                <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                  <div className="text-sm text-[var(--foreground-muted)]">
                    Showing {Math.min(page * limit + 1, totalResults)} to {Math.min((page + 1) * limit, totalResults)} of {totalResults} domains
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0 || loading}
                      className="btn btn-secondary btn-sm"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={(page + 1) * limit >= totalResults || loading || totalResults === 0}
                      className="btn btn-secondary btn-sm"
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

