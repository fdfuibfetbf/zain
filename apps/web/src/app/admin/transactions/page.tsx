'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { DataTable, StatusBadge, formatDate, formatCurrency, getStatusColor } from '../components/DataTable';

type Transaction = {
  id: string;
  userid: string;
  currency: string;
  amount: string;
  fee: string;
  transid: string;
  date: string;
  status: string;
  paymentmethod: string;
  description?: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 50;

  useEffect(() => {
    loadTransactions();
  }, [page, statusFilter]);

  async function loadTransactions() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limitstart: String(page * limit),
        limitnum: String(limit),
      });
      if (statusFilter) params.append('status', statusFilter);

      const data = await apiFetch<{ transactions: Transaction[]; totalresults: number }>(
        `/admin/whmcs/transactions?${params.toString()}`
      );
      setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
      setTotalResults(data.totalresults || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      key: 'transid',
      label: 'Transaction ID',
      render: (transaction: Transaction) => (
        <span className="font-mono font-medium text-[var(--accent-primary)]">{transaction.transid || transaction.id}</span>
      ),
    },
    {
      key: 'userid',
      label: 'Client ID',
      render: (transaction: Transaction) => <span className="font-mono text-[var(--foreground)]">#{transaction.userid}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      render: (transaction: Transaction) => (
        <span className="text-[var(--foreground-muted)]">{transaction.description || '—'}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (transaction: Transaction) => (
        <span className="font-medium text-[var(--foreground)]">
          {formatCurrency(transaction.amount, transaction.currency)}
        </span>
      ),
    },
    {
      key: 'fee',
      label: 'Fee',
      render: (transaction: Transaction) =>
        transaction.fee ? (
          <span className="text-[var(--foreground-muted)]">{formatCurrency(transaction.fee, transaction.currency)}</span>
        ) : (
          '—'
        ),
    },
    {
      key: 'paymentmethod',
      label: 'Payment Method',
      render: (transaction: Transaction) => transaction.paymentmethod || '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (transaction: Transaction) => <StatusBadge status={transaction.status} getStatusColor={getStatusColor} />,
    },
    {
      key: 'date',
      label: 'Date',
      render: (transaction: Transaction) => formatDate(transaction.date),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-2">Transactions</h1>
        <p className="text-[var(--foreground-muted)]">View all payment transactions</p>
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
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
          <button
            onClick={loadTransactions}
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
              <p className="text-sm text-[var(--error)] font-medium">Error loading transactions</p>
              <p className="text-sm text-[var(--error)]/80 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="p-6">
          {loading && transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)] mb-4"></div>
              <p className="text-[var(--foreground-muted)]">Loading transactions...</p>
            </div>
          ) : (
            <>
              <DataTable
                data={transactions}
                columns={columns}
                getRowKey={(transaction) => transaction.id}
                emptyMessage="No transactions found"
              />
              {totalResults > 0 && (
                <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                  <div className="text-sm text-[var(--foreground-muted)]">
                    Showing {Math.min(page * limit + 1, totalResults)} to {Math.min((page + 1) * limit, totalResults)} of {totalResults}{' '}
                    transactions
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

