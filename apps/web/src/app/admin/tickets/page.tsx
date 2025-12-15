'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { DataTable, StatusBadge, formatDate, getStatusColor } from '../components/DataTable';

type Ticket = {
  id: string;
  tid: string;
  deptid: string;
  userid: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  priority: string;
  date: string;
  lastreply?: string;
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 50;

  useEffect(() => {
    loadTickets();
  }, [page, statusFilter]);

  async function loadTickets() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limitstart: String(page * limit),
        limitnum: String(limit),
      });
      if (statusFilter) params.append('status', statusFilter);

      const data = await apiFetch<{ tickets: Ticket[]; totalresults: number }>(
        `/admin/whmcs/tickets?${params.toString()}`
      );
      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
      setTotalResults(data.totalresults || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }

  const getPriorityColor = (priority: string) => {
    const priorityLower = priority?.toLowerCase() || '';
    if (priorityLower.includes('high') || priorityLower === 'urgent') {
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
    if (priorityLower.includes('medium')) {
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  const columns = [
    {
      key: 'tid',
      label: 'Ticket #',
      render: (ticket: Ticket) => (
        <span className="font-mono font-medium text-[#58a6ff]">#{ticket.tid || ticket.id}</span>
      ),
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (ticket: Ticket) => (
        <div>
          <div className="font-medium text-[#f0f6fc]">{ticket.subject || 'N/A'}</div>
          <div className="text-xs text-[#8b949e] mt-0.5">{ticket.name || ticket.email}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (ticket: Ticket) => <StatusBadge status={ticket.status} getStatusColor={getStatusColor} />,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (ticket: Ticket) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
          {ticket.priority || 'Normal'}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Created',
      render: (ticket: Ticket) => formatDate(ticket.date),
    },
    {
      key: 'lastreply',
      label: 'Last Reply',
      render: (ticket: Ticket) => formatDate(ticket.lastreply || ''),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f0f6fc] mb-2">Support Tickets</h1>
        <p className="text-[#8b949e]">Manage all WHMCS support tickets</p>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] focus:outline-none focus:ring-2 focus:ring-[#58a6ff] focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Answered">Answered</option>
              <option value="Closed">Closed</option>
              <option value="Customer-Reply">Customer Reply</option>
            </select>
          </div>
          <button
            onClick={loadTickets}
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
            <p className="text-sm text-red-400 font-medium">Error loading tickets</p>
            <p className="text-sm text-red-300/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <div className="p-6">
          {loading && tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#58a6ff] mb-4"></div>
              <p className="text-[#8b949e]">Loading tickets...</p>
            </div>
          ) : (
            <>
              <DataTable
                data={tickets}
                columns={columns}
                getRowKey={(ticket) => ticket.id}
                emptyMessage="No tickets found"
              />
              {totalResults > 0 && (
                <div className="mt-4 flex items-center justify-between border-t border-[#30363d] pt-4">
                  <div className="text-sm text-[#8b949e]">
                    Showing {Math.min(page * limit + 1, totalResults)} to {Math.min((page + 1) * limit, totalResults)} of {totalResults} tickets
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

