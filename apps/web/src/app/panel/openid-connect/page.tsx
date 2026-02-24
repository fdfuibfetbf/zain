'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Plus, Trash2, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type OpenIdClient = {
  id: string;
  name: string;
  description?: string;
  lastUpdated?: string;
  clientsecret?: string;
};

export default function OpenIdConnectPage() {
  const [clients, setClients] = useState<OpenIdClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadClients();
  }, [currentPage]);

  async function loadClients() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ clients: OpenIdClient[] }>('/panel/openid-connect');
      const clientsList = data.clients || [];
      setClients(clientsList);
      setTotalPages(Math.ceil(clientsList.length / 10) || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load OpenID Connect clients');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setError(null);
    setStatus(null);
    try {
      const result = await apiFetch<{ clientid: string; clientsecret: string }>('/panel/openid-connect', {
        method: 'POST',
        body: JSON.stringify({
          name: `Client ${Date.now()}`,
          description: 'Auto-generated client',
        }),
      });
      setStatus('OpenID Connect client generated successfully! Please save the client secret securely.');
      setShowSecret({ [result.clientid]: true });
      await loadClients();
      setTimeout(() => setStatus(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate OpenID Connect client');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this OpenID Connect client?')) return;

    try {
      await apiFetch(`/panel/openid-connect/${id}`, {
        method: 'DELETE',
      });
      setStatus('OpenID Connect client deleted successfully!');
      await loadClients();
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete OpenID Connect client');
    }
  }

  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const paginatedClients = clients.slice(startIndex, endIndex);

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
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
        <Home className="w-4 h-4" />
        <span>-</span>
        <span>OpenID Connect</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">OpenID Connect</h1>
        <p className="text-[var(--foreground-muted)] mt-2">
          Create and manage credentials that are able to access and use the API's.
        </p>
      </div>

      {/* Generate Button */}
      <div>
        <button onClick={handleGenerate} className="btn btn-primary bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)]">
          <Plus className="w-4 h-4" />
          Generate New Client API Credentials
        </button>
      </div>

      {status && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-[var(--success-bg)] border border-[var(--success)]"
        >
          <p className="text-[var(--success)] text-sm">{status}</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-[var(--error-bg)] border border-[var(--error)]"
        >
          <p className="text-[var(--error)] text-sm">{error}</p>
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-header flex items-center justify-between bg-[var(--accent-primary)] text-white">
          <h2 className="text-lg font-semibold">Client API Credentials</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              {clients.length} Records Found, Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <label className="text-sm">Jump to Page:</label>
              <select
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                className="input w-20 bg-white text-[var(--foreground)]"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <option key={page} value={page}>
                    {page}
                  </option>
                ))}
              </select>
              <button className="btn btn-secondary bg-white text-[var(--accent-primary)] hover:bg-gray-100">Go</button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {paginatedClients.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[var(--foreground-muted)] mb-2">No Records Found</p>
              <p className="text-sm text-[var(--foreground-subtle)]">Generate your first client API credentials to get started</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-2)]">
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--foreground)]">
                    <div className="flex items-center gap-2">
                      Name
                      <span className="text-xs text-[var(--foreground-subtle)]">▲</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--foreground)]">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--foreground)]">Last Updated</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-[var(--foreground)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <td className="px-6 py-4 text-[var(--foreground)] font-medium">{client.name}</td>
                    <td className="px-6 py-4 text-[var(--foreground-muted)]">{client.description || '-'}</td>
                    <td className="px-6 py-4 text-[var(--foreground-muted)] text-sm">
                      {client.lastUpdated ? new Date(client.lastUpdated).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="btn-icon btn-ghost text-[var(--error)] hover:bg-[var(--error-bg)]"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {clients.length > 0 && (
          <div className="card-body border-t border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-2)]">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Page
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Page
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
