'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Service = {
  serviceId: number;
  productId: number;
  name: string;
  status: string;
  server: null | { status: string; ip?: string; providerResourceId: string };
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

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
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  async function runAction(serviceId: number, action: string) {
    setBusy(serviceId);
    setError(null);
    try {
      await apiFetch(`/panel/services/${serviceId}/actions`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusy(null);
    }
  }

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (statusLower === 'suspended') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (statusLower === 'pending') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  const getServerStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active') return 'bg-green-500/10 text-green-400';
    if (statusLower === 'provisioning') return 'bg-yellow-500/10 text-yellow-400';
    if (statusLower === 'suspended' || statusLower === 'stopped') return 'bg-red-500/10 text-red-400';
    return 'bg-gray-500/10 text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#58a6ff] mb-4"></div>
          <p className="text-[#8b949e]">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#f0f6fc] mb-2">Services</h1>
        <p className="text-[#8b949e]">Manage and monitor your services and servers</p>
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
            <p className="text-sm text-red-400 font-medium">Error</p>
            <p className="text-sm text-red-300/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {services.length === 0 ? (
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
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-[#8b949e] mb-2">No services found</p>
          <p className="text-sm text-[#6e7681]">Your services will appear here once they're provisioned.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {services.map((service) => (
            <div
              key={service.serviceId}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-[#58a6ff]/50 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#58a6ff] to-[#8b5cf6] flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#f0f6fc]">{service.name}</h3>
                      <p className="text-sm text-[#8b949e]">Service #{service.serviceId}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div>
                      <span className="text-xs text-[#6e7681] uppercase tracking-wide">Status</span>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}
                        >
                          {service.status}
                        </span>
                      </div>
                    </div>
                    {service.server && (
                      <>
                        <div>
                          <span className="text-xs text-[#6e7681] uppercase tracking-wide">Server Status</span>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getServerStatusColor(service.server.status)}`}
                            >
                              {service.server.status}
                            </span>
                          </div>
                        </div>
                        {service.server.ip && (
                          <div>
                            <span className="text-xs text-[#6e7681] uppercase tracking-wide">IP Address</span>
                            <div className="mt-1">
                              <span className="text-sm font-mono text-[#c9d1d9]">{service.server.ip}</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {service.server && (
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/panel/servers/${service.serviceId}`}
                      className="px-4 py-2 bg-[#21262d] border border-[#30363d] text-[#c9d1d9] rounded-lg text-sm font-medium hover:bg-[#30363d] transition-colors"
                    >
                      Manage
                    </Link>
                  </div>
                )}
                {!service.server && (
                  <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-400">Server not provisioned yet</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

