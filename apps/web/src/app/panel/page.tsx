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

type Stats = {
  totalServices: number;
  activeServices: number;
  totalInvoices: number;
  pendingInvoices: number;
};

export default function PanelDashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [servicesData] = await Promise.all([
        apiFetch<{ services: Service[] }>('/panel/services').catch(() => ({ services: [] })),
      ]);

      setServices(servicesData.services || []);
      
      // Calculate stats
      const activeServices = servicesData.services?.filter((s) => s.status === 'Active').length || 0;
      setStats({
        totalServices: servicesData.services?.length || 0,
        activeServices,
        totalInvoices: 0,
        pendingInvoices: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (statusLower === 'suspended') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (statusLower === 'pending') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b82f6] mb-4"></div>
          <p className="text-[#6b7280]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#f0f6fc] mb-2">Overview</h1>
        <p className="text-[#8b949e]">Welcome back! Here's what's happening with your services.</p>
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
            <p className="text-sm text-red-400 font-medium">Error loading data</p>
            <p className="text-sm text-red-300/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Services"
          value={stats?.totalServices ?? 0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          }
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Active Services"
          value={stats?.activeServices ?? 0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Total Invoices"
          value={stats?.totalInvoices ?? 0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Pending Invoices"
          value={stats?.pendingInvoices ?? 0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="from-orange-500 to-red-500"
        />
      </div>

      {/* Recent Services */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#f0f6fc]">Your Services</h2>
          <Link
            href="/panel/services"
            className="text-sm text-[#58a6ff] hover:text-[#79c0ff] font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-[#21262d]">
          {services.length === 0 ? (
            <div className="p-8 text-center">
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
            services.slice(0, 5).map((service) => (
              <div key={service.serviceId} className="p-6 hover:bg-[#0d1117] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-[#f0f6fc]">{service.name}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}
                      >
                        {service.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#8b949e]">
                      <span>Service #{service.serviceId}</span>
                      {service.server && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{service.server.ip || 'No IP'}</span>
                          <span>•</span>
                          <span className="capitalize">{service.server.status}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Link
                    href="/panel/services"
                    className="ml-4 text-sm text-[#58a6ff] hover:text-[#79c0ff] font-medium"
                  >
                    Manage →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-[#58a6ff]/50 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color} text-white`}>{icon}</div>
        <div className="text-2xl font-bold text-[#f0f6fc]">{value.toLocaleString()}</div>
      </div>
      <p className="text-sm text-[#8b949e]">{title}</p>
    </div>
  );
}
