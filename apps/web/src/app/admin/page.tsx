'use client';

import { useEffect, useState } from 'react';
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

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('active') || statusLower.includes('completed') || statusLower === 'paid') {
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    }
    if (statusLower.includes('pending') || statusLower.includes('processing')) {
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
    if (statusLower.includes('suspended') || statusLower.includes('cancelled') || statusLower === 'unpaid') {
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#58a6ff] mb-4"></div>
          <p className="text-[#8b949e]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#f0f6fc] mb-2">Dashboard</h1>
        <p className="text-[#8b949e]">Overview of your WHMCS orders, services, and clients</p>
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
            <button
              onClick={loadData}
              className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders ?? 0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Total Clients"
          value={stats?.totalClients ?? 0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Total Services"
          value={stats?.totalServices ?? 0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
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
          color="from-orange-500 to-red-500"
        />
      </div>

      {/* Data Tables */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-[#30363d] flex">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'orders'
                ? 'text-[#58a6ff] border-[#58a6ff]'
                : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9] hover:border-[#30363d]'
            }`}
          >
            Recent Orders
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'services'
                ? 'text-[#58a6ff] border-[#58a6ff]'
                : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9] hover:border-[#30363d]'
            }`}
          >
            Active Services
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'clients'
                ? 'text-[#58a6ff] border-[#58a6ff]'
                : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9] hover:border-[#30363d]'
            }`}
          >
            Clients
          </button>
            </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'orders' && (
            <OrdersTable orders={orders} formatDate={formatDate} formatCurrency={formatCurrency} getStatusColor={getStatusColor} />
          )}
          {activeTab === 'services' && (
            <ServicesTable services={services} formatDate={formatDate} formatCurrency={formatCurrency} getStatusColor={getStatusColor} />
          )}
          {activeTab === 'clients' && (
            <ClientsTable clients={clients} formatDate={formatDate} getStatusColor={getStatusColor} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-[#58a6ff]/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color} text-white`}>{icon}</div>
        <div className="text-2xl font-bold text-[#f0f6fc]">{value.toLocaleString()}</div>
      </div>
      <p className="text-sm text-[#8b949e]">{title}</p>
    </div>
  );
}

function OrdersTable({
  orders,
  formatDate,
  formatCurrency,
  getStatusColor,
}: {
  orders: Order[];
  formatDate: (date: string) => string;
  formatCurrency: (amount: string, currency?: string) => string;
  getStatusColor: (status: string) => string;
}) {
  if (orders.length === 0) {
    return <EmptyState message="No orders found" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#30363d]">
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">Order #</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">Client</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-[#21262d] hover:bg-[#161b22] transition-colors">
              <td className="py-3 px-4 text-sm text-[#c9d1d9] font-mono">#{order.ordernum || order.id}</td>
              <td className="py-3 px-4 text-sm text-[#c9d1d9]">
                {order.client
                  ? `${order.client.firstname || ''} ${order.client.lastname || ''}`.trim() || order.client.email
                  : `User #${order.userid}`}
              </td>
              <td className="py-3 px-4 text-sm text-[#8b949e]">{formatDate(order.date)}</td>
              <td className="py-3 px-4 text-sm text-[#c9d1d9] font-medium">
                {formatCurrency(order.amount, order.currency)}
              </td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
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
  getStatusColor,
}: {
  services: Service[];
  formatDate: (date: string) => string;
  formatCurrency: (amount: string, currency?: string) => string;
  getStatusColor: (status: string) => string;
}) {
  if (services.length === 0) {
    return <EmptyState message="No services found" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#30363d]">
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">Service</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">Domain</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">Next Due</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">Server</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id} className="border-b border-[#21262d] hover:bg-[#161b22] transition-colors">
              <td className="py-3 px-4 text-sm text-[#c9d1d9] font-medium">{service.product || 'N/A'}</td>
              <td className="py-3 px-4 text-sm text-[#c9d1d9] font-mono">{service.domain || 'N/A'}</td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                  {service.status || 'Unknown'}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-[#8b949e]">{formatDate(service.nextduedate || '')}</td>
              <td className="py-3 px-4 text-sm text-[#c9d1d9] font-medium">
                {formatCurrency(service.amount, service.currency)}
              </td>
              <td className="py-3 px-4 text-sm">
                {service.server ? (
                  <div className="flex flex-col gap-1">
                    {service.server.ip && (
                      <span className="text-[#c9d1d9] font-mono text-xs">{service.server.ip}</span>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(service.server.status)}`}>
                      {service.server.status}
                    </span>
                  </div>
                ) : (
                  <span className="text-[#8b949e] text-xs">Not provisioned</span>
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
  getStatusColor,
}: {
  clients: Client[];
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
}) {
  if (clients.length === 0) {
    return <EmptyState message="No clients found" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#30363d]">
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">Email</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">Company</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">Created</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-b border-[#21262d] hover:bg-[#161b22] transition-colors">
              <td className="py-3 px-4 text-sm text-[#c9d1d9] font-medium">
                {`${client.firstname || ''} ${client.lastname || ''}`.trim() || 'N/A'}
              </td>
              <td className="py-3 px-4 text-sm text-[#c9d1d9]">{client.email || 'N/A'}</td>
              <td className="py-3 px-4 text-sm text-[#8b949e]">{client.companyname || '—'}</td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                  {client.status || 'Unknown'}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-[#8b949e]">{formatDate(client.datecreated)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
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
      <p className="text-[#8b949e]">{message}</p>
    </div>
  );
}
