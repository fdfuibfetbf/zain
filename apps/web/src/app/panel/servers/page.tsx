'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

type Service = {
  serviceId: number;
  productId: number;
  name: string;
  status: string;
  server: null | {
    status: string;
    ip?: string;
    providerResourceId: string;
  };
};

export default function ServersPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ services: Service[] }>('/panel/services');
      setServices(data.services || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load servers');
    } finally {
      setLoading(false);
    }
  }

  const filteredServices = services.filter((service) => {
    if (filter === 'all') return true;
    if (filter === 'active') return service.server?.status === 'active';
    if (filter === 'suspended') return service.server?.status === 'suspended';
    if (filter === 'pending') return service.server?.status === 'pending' || service.server?.status === 'provisioning';
    return true;
  });

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (statusLower === 'suspended' || statusLower === 'stopped') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (statusLower === 'pending' || statusLower === 'provisioning') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    if (statusLower === 'terminated' || statusLower === 'error') return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#58a6ff] mb-4"></div>
          <p className="text-[#8b949e]">Loading servers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#f0f6fc] mb-2">VPS Servers</h1>
          <p className="text-[#8b949e]">Manage and monitor your virtual private servers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'suspended', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] border border-transparent'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
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
            <p className="text-sm text-red-400 font-medium">Error loading servers</p>
            <p className="text-sm text-red-300/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {filteredServices.length === 0 ? (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-[#8b949e] mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
            />
          </svg>
          <p className="text-[#8b949e] mb-2">No servers found</p>
          <p className="text-sm text-[#6e7681]">Your VPS servers will appear here once they're provisioned.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <Link
              key={service.serviceId}
              href={`/panel/servers/${service.serviceId}`}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-[#58a6ff]/50 transition-all hover:shadow-lg hover:shadow-[#58a6ff]/10 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#58a6ff] to-[#8b5cf6] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#f0f6fc] group-hover:text-[#58a6ff] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-[#8b949e]">Service #{service.serviceId}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {service.server ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#8b949e]">Server Status</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          service.server.status
                        )}`}
                      >
                        {service.server.status}
                      </span>
                    </div>
                    {service.server.ip && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#8b949e]">IP Address</span>
                        <span className="text-sm font-mono text-[#c9d1d9]">{service.server.ip}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#8b949e]">Service Status</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          service.status
                        )}`}
                      >
                        {service.status}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <svg className="w-4 h-4 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm text-yellow-400">Server not provisioned</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[#30363d] flex items-center text-sm text-[#58a6ff] group-hover:text-[#79c0ff] transition-colors">
                <span>View Details</span>
                <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

