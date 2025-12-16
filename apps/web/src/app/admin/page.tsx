'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

type Stats = {
  totalOrders: number;
  totalClients: number;
  totalServices: number;
  totalInvoices: number;
};

type Order = {
  id: string;
  ordernum: string;
  userid: string;
  date: string;
  status: string;
  amount: string;
  currency: string;
  paymentmethod?: string;
  client?: { firstname?: string; lastname?: string; email?: string };
};

type Service = {
  id: string;
  userid: string;
  product: string;
  domain: string;
  status: string;
  amount: string;
  currency: string;
  nextduedate?: string;
  server?: { status: string; ip: string | null; providerResourceId: string | null } | null;
};

type Client = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  companyname?: string;
  status: string;
  datecreated: string;
};

// Icons
const Icons = {
  Orders: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Server: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
    </svg>
  ),
  Invoice: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  TrendUp: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  TrendDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  ExternalLink: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Cloud: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    </svg>
  ),
  Activity: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
    </svg>
  ),
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'services' | 'clients'>('orders');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [statsData, ordersData, servicesData, clientsData] = await Promise.all([
        apiFetch<{ stats: Stats }>('/admin/whmcs/stats').catch(() => ({ stats: { totalOrders: 0, totalClients: 0, totalServices: 0, totalInvoices: 0 } })),
        apiFetch<{ orders: Order[] }>('/admin/whmcs/orders?limitnum=10').catch(() => ({ orders: [] })),
        apiFetch<{ services: Service[] }>('/admin/whmcs/services?limitnum=10').catch(() => ({ services: [] })),
        apiFetch<{ clients: Client[] }>('/admin/whmcs/clients?limitnum=10').catch(() => ({ clients: [] })),
      ]);

      setStats(statsData.stats);
      setOrders(Array.isArray(ordersData.orders) ? ordersData.orders : ordersData.orders ? [ordersData.orders] : []);
      setServices(Array.isArray(servicesData.services) ? servicesData.services : servicesData.services ? [servicesData.services] : []);
      setClients(Array.isArray(clientsData.clients) ? clientsData.clients : clientsData.clients ? [clientsData.clients] : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: string, currency: string = 'USD') => {
    const num = parseFloat(amount || '0');
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('active') || statusLower.includes('completed') || statusLower === 'paid') {
      return 'badge badge-success';
    }
    if (statusLower.includes('pending') || statusLower.includes('processing')) {
      return 'badge badge-warning';
    }
    if (statusLower.includes('suspended') || statusLower.includes('cancelled') || statusLower === 'unpaid') {
      return 'badge badge-error';
    }
    return 'badge badge-neutral';
  };

  if (loading && !stats) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="skeleton h-8 w-48"></div>
          <div className="skeleton h-5 w-80"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="surface-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="skeleton w-12 h-12 rounded-xl"></div>
                <div className="skeleton w-16 h-6"></div>
              </div>
              <div className="skeleton h-8 w-24 mb-2"></div>
              <div className="skeleton h-4 w-32"></div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="surface-card overflow-hidden">
          <div className="p-6 border-b border-[var(--border-subtle)]">
            <div className="skeleton h-6 w-40"></div>
          </div>
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="skeleton h-12 flex-1 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      icon: Icons.Orders,
      trend: '+12.5%',
      trendUp: true,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-500/20 to-cyan-500/10',
      link: '/admin/orders',
    },
    {
      title: 'Total Clients',
      value: stats?.totalClients ?? 0,
      icon: Icons.Users,
      trend: '+8.2%',
      trendUp: true,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-500/20 to-pink-500/10',
      link: '/admin/clients',
    },
    {
      title: 'Active Services',
      value: stats?.totalServices ?? 0,
      icon: Icons.Server,
      trend: '+5.1%',
      trendUp: true,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'from-emerald-500/20 to-teal-500/10',
      link: '/admin/services',
    },
    {
      title: 'Total Invoices',
      value: stats?.totalInvoices ?? 0,
      icon: Icons.Invoice,
      trend: '-2.3%',
      trendUp: false,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'from-orange-500/20 to-amber-500/10',
      link: '/admin/invoices',
    },
  ];

  const quickActions = [
    { label: 'Setup Wizard', icon: Icons.Settings, href: '/admin/setup', description: 'Configure your system' },
    { label: 'Providers', icon: Icons.Cloud, href: '/admin/providers', description: 'Manage cloud providers' },
    { label: 'View Logs', icon: Icons.Activity, href: '/admin/logs', description: 'Check audit logs' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-[var(--foreground-muted)]">
            Welcome back! Here&apos;s what&apos;s happening with your platform today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-secondary"
          >
            <Icons.Refresh />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link href="/admin/setup" className="btn-primary">
            <Icons.Plus />
            <span>Quick Setup</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-[var(--error-soft)] border border-[var(--error)]/30 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--error)]/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[var(--error)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--error)]">Error loading data</h3>
              <p className="text-sm text-[var(--error)]/80 mt-1">{error}</p>
              <button onClick={loadData} className="mt-2 text-sm font-medium text-[var(--error)] hover:underline">
                Try again →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Link
            key={card.title}
            href={card.link}
            className="surface-card-interactive p-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.bgColor} flex items-center justify-center`}>
                <span className={`bg-gradient-to-br ${card.color} bg-clip-text text-transparent`}>
                  <card.icon />
                </span>
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${card.trendUp ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                {card.trendUp ? <Icons.TrendUp /> : <Icons.TrendDown />}
                {card.trend}
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {card.value.toLocaleString()}
            </div>
            <div className="text-sm text-[var(--foreground-muted)]">{card.title}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <Link
            key={action.label}
            href={action.href}
            className="surface-card p-5 flex items-center gap-4 group opacity-0 animate-fade-in"
            style={{ animationDelay: `${400 + index * 100}ms`, animationFillMode: 'forwards' }}
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--foreground-muted)] group-hover:text-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)]/10 transition-colors">
              <action.icon />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white group-hover:text-[var(--accent-primary)] transition-colors">{action.label}</h3>
              <p className="text-sm text-[var(--foreground-subtle)]">{action.description}</p>
            </div>
            <Icons.ArrowRight />
          </Link>
        ))}
      </div>

      {/* Data Tables */}
      <div className="surface-card overflow-hidden opacity-0 animate-fade-in-up" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
        {/* Tabs */}
        <div className="border-b border-[var(--border-subtle)]">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'orders', label: 'Recent Orders', count: orders.length },
              { id: 'services', label: 'Active Services', count: services.length },
              { id: 'clients', label: 'New Clients', count: clients.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-[var(--foreground-muted)] hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                      : 'bg-[var(--surface-2)] text-[var(--foreground-subtle)]'
                  }`}>
                    {tab.count}
                  </span>
                </span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'orders' && (
            <OrdersTable orders={orders} formatDate={formatDate} formatCurrency={formatCurrency} getStatusBadge={getStatusBadge} />
          )}
          {activeTab === 'services' && (
            <ServicesTable services={services} formatDate={formatDate} formatCurrency={formatCurrency} getStatusBadge={getStatusBadge} />
          )}
          {activeTab === 'clients' && (
            <ClientsTable clients={clients} formatDate={formatDate} getStatusBadge={getStatusBadge} />
          )}
        </div>

        {/* View All Link */}
        <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--surface-1)]">
          <Link
            href={`/admin/${activeTab}`}
            className="text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] transition-colors flex items-center gap-2"
          >
            View all {activeTab}
            <Icons.ExternalLink />
          </Link>
        </div>
      </div>
    </div>
  );
}

function OrdersTable({
  orders,
  formatDate,
  formatCurrency,
  getStatusBadge,
}: {
  orders: Order[];
  formatDate: (date: string) => string;
  formatCurrency: (amount: string, currency?: string) => string;
  getStatusBadge: (status: string) => string;
}) {
  if (orders.length === 0) {
    return <EmptyState message="No orders found" />;
  }

  return (
    <div className="overflow-x-auto -mx-6">
      <table className="table-modern w-full min-w-[600px]">
        <thead>
          <tr>
            <th className="pl-6">Order</th>
            <th>Client</th>
            <th>Date</th>
            <th>Amount</th>
            <th className="pr-6">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="pl-6">
                <span className="font-mono text-[var(--accent-primary)]">#{order.ordernum || order.id}</span>
              </td>
              <td>
                <div>
                  <div className="font-medium text-white">
                    {order.client
                      ? `${order.client.firstname || ''} ${order.client.lastname || ''}`.trim() || order.client.email
                      : `User #${order.userid}`}
                  </div>
                  {order.client?.email && (
                    <div className="text-xs text-[var(--foreground-subtle)]">{order.client.email}</div>
                  )}
                </div>
              </td>
              <td className="text-[var(--foreground-muted)]">{formatDate(order.date)}</td>
              <td className="font-semibold text-white">{formatCurrency(order.amount, order.currency)}</td>
              <td className="pr-6">
                <span className={getStatusBadge(order.status)}>
                  <span className="dot-indicator dot-success w-1.5 h-1.5"></span>
                  {order.status || 'Unknown'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ServicesTable({
  services,
  formatDate,
  formatCurrency,
  getStatusBadge,
}: {
  services: Service[];
  formatDate: (date: string) => string;
  formatCurrency: (amount: string, currency?: string) => string;
  getStatusBadge: (status: string) => string;
}) {
  if (services.length === 0) {
    return <EmptyState message="No services found" />;
  }

  return (
    <div className="overflow-x-auto -mx-6">
      <table className="table-modern w-full min-w-[700px]">
        <thead>
          <tr>
            <th className="pl-6">Service</th>
            <th>Domain</th>
            <th>Status</th>
            <th>Next Due</th>
            <th>Amount</th>
            <th className="pr-6">Server</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td className="pl-6">
                <span className="font-medium text-white">{service.product || 'N/A'}</span>
              </td>
              <td>
                <span className="font-mono text-[var(--accent-primary)]">{service.domain || 'N/A'}</span>
              </td>
              <td>
                <span className={getStatusBadge(service.status)}>{service.status || 'Unknown'}</span>
              </td>
              <td className="text-[var(--foreground-muted)]">{formatDate(service.nextduedate || '')}</td>
              <td className="font-semibold text-white">{formatCurrency(service.amount, service.currency)}</td>
              <td className="pr-6">
                {service.server ? (
                  <div className="flex flex-col gap-1">
                    {service.server.ip && (
                      <span className="font-mono text-xs text-[var(--foreground-muted)]">{service.server.ip}</span>
                    )}
                    <span className={getStatusBadge(service.server.status)}>{service.server.status}</span>
                  </div>
                ) : (
                  <span className="text-[var(--foreground-subtle)] text-xs italic">Not provisioned</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClientsTable({
  clients,
  formatDate,
  getStatusBadge,
}: {
  clients: Client[];
  formatDate: (date: string) => string;
  getStatusBadge: (status: string) => string;
}) {
  if (clients.length === 0) {
    return <EmptyState message="No clients found" />;
  }

  return (
    <div className="overflow-x-auto -mx-6">
      <table className="table-modern w-full min-w-[600px]">
        <thead>
          <tr>
            <th className="pl-6">Client</th>
            <th>Email</th>
            <th>Company</th>
            <th>Status</th>
            <th className="pr-6">Created</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="pl-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white text-sm font-semibold">
                    {client.firstname?.charAt(0) || client.email?.charAt(0) || '?'}
                  </div>
                  <span className="font-medium text-white">
                    {`${client.firstname || ''} ${client.lastname || ''}`.trim() || 'N/A'}
                  </span>
                </div>
              </td>
              <td>
                <a href={`mailto:${client.email}`} className="text-[var(--accent-primary)] hover:underline">
                  {client.email || 'N/A'}
                </a>
              </td>
              <td className="text-[var(--foreground-muted)]">{client.companyname || '—'}</td>
              <td>
                <span className={getStatusBadge(client.status)}>{client.status || 'Unknown'}</span>
              </td>
              <td className="pr-6 text-[var(--foreground-muted)]">{formatDate(client.datecreated)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center">
        <svg className="w-8 h-8 text-[var(--foreground-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-[var(--foreground-muted)]">{message}</p>
    </div>
  );
}
