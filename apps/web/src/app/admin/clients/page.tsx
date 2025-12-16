'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Building,
  MapPin,
  Plus,
  MoreVertical,
  ChevronRight,
  UserPlus,
  Download,
  Filter,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Client = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  companyname?: string;
  status: string;
  datecreated: string;
  phonenumber?: string;
  country?: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    try {
      const data = await apiFetch<{ clients: Client[] }>('/admin/whmcs/clients').catch(() => ({
        clients: [
          { id: '1', firstname: 'John', lastname: 'Doe', email: 'john@example.com', companyname: 'Tech Corp', status: 'Active', datecreated: '2024-01-15', phonenumber: '+1 234 567 890', country: 'United States' },
          { id: '2', firstname: 'Jane', lastname: 'Smith', email: 'jane@startup.io', companyname: 'Startup Inc', status: 'Active', datecreated: '2024-02-20', phonenumber: '+44 789 123 456', country: 'United Kingdom' },
          { id: '3', firstname: 'Mike', lastname: 'Johnson', email: 'mike@enterprise.com', companyname: 'Enterprise Ltd', status: 'Inactive', datecreated: '2024-03-10', phonenumber: '+49 321 654 987', country: 'Germany' },
          { id: '4', firstname: 'Sarah', lastname: 'Williams', email: 'sarah@digital.co', companyname: 'Digital Agency', status: 'Active', datecreated: '2024-04-05', phonenumber: '+1 555 123 789', country: 'Canada' },
          { id: '5', firstname: 'Alex', lastname: 'Brown', email: 'alex@cloudtech.com', companyname: '', status: 'Active', datecreated: '2024-05-12', phonenumber: '+61 432 109 876', country: 'Australia' },
        ],
      }));
      setClients(Array.isArray(data.clients) ? data.clients : []);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active') {
      return 'badge-success';
    }
    if (statusLower === 'inactive') {
      return 'badge-neutral';
    }
    if (statusLower === 'suspended') {
      return 'badge-error';
    }
    return 'badge-neutral';
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

  const filteredClients = clients.filter((client) => {
    const fullName = `${client.firstname} ${client.lastname}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.companyname?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-48"></div>
          <div className="skeleton h-10 w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="skeleton w-14 h-14 rounded-full"></div>
                <div className="flex-1">
                  <div className="skeleton h-5 w-32 mb-2"></div>
                  <div className="skeleton h-4 w-24"></div>
                </div>
              </div>
              <div className="skeleton h-4 w-full mb-2"></div>
              <div className="skeleton h-4 w-3/4"></div>
            </div>
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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Clients</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            Manage your customer accounts and information
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn btn-primary">
            <UserPlus className="w-4 h-4" />
            Add Client
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="input-with-icon flex-1">
          <Search className="input-icon w-4 h-4" />
          <input
            type="text"
            placeholder="Search clients..."
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
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <button onClick={loadClients} className="btn btn-secondary">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Clients', value: clients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active', value: clients.filter((c) => c.status === 'Active').length, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Inactive', value: clients.filter((c) => c.status === 'Inactive').length, icon: Users, color: 'text-gray-600', bg: 'bg-gray-50' },
          { label: 'This Month', value: clients.filter((c) => new Date(c.datecreated) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-50' },
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

      {/* Clients Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredClients.length === 0 ? (
          <div className="col-span-full">
            <div className="card p-12 text-center">
              <Users className="w-16 h-16 text-[var(--foreground-subtle)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No clients found</h3>
              <p className="text-[var(--foreground-muted)]">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="card card-interactive p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="avatar avatar-lg">
                    {client.firstname?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">
                      {client.firstname} {client.lastname}
                    </h3>
                    {client.companyname && (
                      <p className="text-sm text-[var(--foreground-muted)] flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {client.companyname}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`badge ${getStatusBadge(client.status)}`}>
                  <span className="badge-dot"></span>
                  {client.status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${client.email}`} className="hover:text-[var(--accent-primary)]">
                    {client.email}
                  </a>
                </div>
                {client.phonenumber && (
                  <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                    <Phone className="w-4 h-4" />
                    <span>{client.phonenumber}</span>
                  </div>
                )}
                {client.country && (
                  <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                    <MapPin className="w-4 h-4" />
                    <span>{client.country}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-xs text-[var(--foreground-subtle)]">
                  Joined {formatDate(client.datecreated)}
                </span>
                <button className="text-[var(--accent-primary)] text-sm font-medium hover:underline flex items-center gap-1">
                  View Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
