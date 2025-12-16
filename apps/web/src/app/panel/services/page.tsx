'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'active') return 'text-green-500';
    if (s === 'suspended') return 'text-red-500';
    if (s === 'pending') return 'text-yellow-500';
    return 'text-[#666]';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-5 h-5 border border-[#333] border-t-white rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-[#666]">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-medium text-white">Services</h1>
        <p className="text-xs text-[#666] mt-1">Manage your active services</p>
      </div>

      {error && (
        <div className="bg-[#1a0a0a] border border-[#3d1f1f] rounded-md px-3 py-2 mb-4">
          <p className="text-xs text-[#f87171]">{error}</p>
        </div>
      )}

      {services.length === 0 ? (
        <div className="border border-[#222] rounded-lg p-8 text-center">
          <p className="text-sm text-[#666]">No services found</p>
          <p className="text-xs text-[#444] mt-1">Your services will appear here once provisioned.</p>
        </div>
      ) : (
        <div className="border border-[#222] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222] bg-[#0a0a0a]">
                <th className="text-left text-xs font-medium text-[#666] px-4 py-2">Service</th>
                <th className="text-left text-xs font-medium text-[#666] px-4 py-2">Status</th>
                <th className="text-left text-xs font-medium text-[#666] px-4 py-2">Server</th>
                <th className="text-left text-xs font-medium text-[#666] px-4 py-2">IP</th>
                <th className="text-right text-xs font-medium text-[#666] px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.serviceId} className="border-b border-[#222] last:border-0 hover:bg-[#0a0a0a]">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-white">{service.name}</p>
                      <p className="text-xs text-[#666]">#{service.serviceId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {service.server ? (
                      <span className={`text-xs ${getStatusColor(service.server.status)}`}>
                        {service.server.status}
                      </span>
                    ) : (
                      <span className="text-xs text-[#444]">Not provisioned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {service.server?.ip ? (
                      <span className="text-xs font-mono text-[#888]">{service.server.ip}</span>
                    ) : (
                      <span className="text-xs text-[#444]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {service.server && (
                      <Link
                        href={`/panel/servers/${service.serviceId}`}
                        className="text-xs text-white hover:underline"
                      >
                        Manage →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
