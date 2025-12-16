'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  CreditCard,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await apiFetch<{ orders: Order[] }>('/admin/whmcs/orders').catch(() => ({
        orders: [
          { id: '1', ordernum: 'ORD-2024-001', userid: '101', date: '2024-12-15', status: 'Active', amount: '199.00', currency: 'USD', paymentmethod: 'Credit Card', client: { firstname: 'John', lastname: 'Doe', email: 'john@example.com' } },
          { id: '2', ordernum: 'ORD-2024-002', userid: '102', date: '2024-12-14', status: 'Pending', amount: '79.00', currency: 'USD', paymentmethod: 'PayPal', client: { firstname: 'Jane', lastname: 'Smith', email: 'jane@startup.io' } },
          { id: '3', ordernum: 'ORD-2024-003', userid: '103', date: '2024-12-13', status: 'Active', amount: '299.00', currency: 'USD', paymentmethod: 'Bank Transfer', client: { firstname: 'Mike', lastname: 'Johnson', email: 'mike@enterprise.com' } },
          { id: '4', ordernum: 'ORD-2024-004', userid: '104', date: '2024-12-12', status: 'Cancelled', amount: '49.00', currency: 'USD', paymentmethod: 'Credit Card', client: { firstname: 'Sarah', lastname: 'Williams', email: 'sarah@digital.co' } },
          { id: '5', ordernum: 'ORD-2024-005', userid: '105', date: '2024-12-11', status: 'Active', amount: '159.00', currency: 'USD', paymentmethod: 'Credit Card', client: { firstname: 'Alex', lastname: 'Brown', email: 'alex@cloudtech.com' } },
        ],
      }));
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active' || statusLower === 'completed') {
      return 'badge-success';
    }
    if (statusLower === 'pending') {
      return 'badge-warning';
    }
    if (statusLower === 'cancelled' || statusLower === 'refunded') {
      return 'badge-error';
    }
    return 'badge-neutral';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active' || statusLower === 'completed') {
      return <CheckCircle className="w-4 h-4" />;
    }
    if (statusLower === 'pending') {
      return <Clock className="w-4 h-4" />;
    }
    if (statusLower === 'cancelled' || statusLower === 'refunded') {
      return <XCircle className="w-4 h-4" />;
    }
    return <Clock className="w-4 h-4" />;
  };

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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.ordernum?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${order.client?.firstname} ${order.client?.lastname}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.filter(o => o.status !== 'Cancelled').reduce((acc, o) => acc + parseFloat(o.amount || '0'), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-48"></div>
          <div className="skeleton h-10 w-32"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-8 w-24 mb-2"></div>
              <div className="skeleton h-4 w-32"></div>
            </div>
          ))}
        </div>
        <div className="card p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16 w-full rounded-xl mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Orders</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            Track and manage all customer orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button onClick={loadOrders} className="btn btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Orders', value: orders.filter((o) => o.status === 'Active').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pending', value: orders.filter((o) => o.status === 'Pending').length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Total Revenue', value: formatCurrency(totalRevenue.toString()), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="input-with-icon flex-1">
          <Search className="input-icon w-4 h-4" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <ShoppingCart className="w-12 h-12 text-[var(--foreground-subtle)] mb-4" />
                      <p className="text-[var(--foreground-muted)]">No orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--info-soft)] flex items-center justify-center">
                          <Package className="w-5 h-5 text-[var(--accent-primary)]" />
                        </div>
                        <div>
                          <p className="font-mono font-medium text-[var(--accent-primary)]">#{order.ordernum}</p>
                          <p className="text-xs text-[var(--foreground-muted)]">ID: {order.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {order.client?.firstname} {order.client?.lastname}
                        </p>
                        <p className="text-sm text-[var(--foreground-muted)]">{order.client?.email}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.date)}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm">{order.paymentmethod || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="font-semibold text-[var(--foreground)]">
                      {formatCurrency(order.amount, order.currency)}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
