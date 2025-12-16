'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Cloud,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  Globe,
  Zap,
  Plus,
  Settings,
  MoreVertical,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

const usageData = [
  { time: '00:00', cpu: 45, memory: 62, disk: 38 },
  { time: '04:00', cpu: 32, memory: 58, disk: 39 },
  { time: '08:00', cpu: 65, memory: 71, disk: 40 },
  { time: '12:00', cpu: 78, memory: 82, disk: 42 },
  { time: '16:00', cpu: 82, memory: 85, disk: 44 },
  { time: '20:00', cpu: 56, memory: 68, disk: 45 },
  { time: '24:00', cpu: 42, memory: 60, disk: 46 },
];

const servers = [
  {
    id: 1,
    name: 'Production Server 1',
    status: 'running',
    ip: '192.168.1.100',
    location: 'US East',
    cpu: 4,
    memory: 16,
    disk: 100,
    usage: { cpu: 78, memory: 65, disk: 45 },
    uptime: '45 days',
  },
  {
    id: 2,
    name: 'Staging Server',
    status: 'running',
    ip: '192.168.1.101',
    location: 'EU West',
    cpu: 2,
    memory: 8,
    disk: 50,
    usage: { cpu: 34, memory: 42, disk: 28 },
    uptime: '12 days',
  },
  {
    id: 3,
    name: 'Development Server',
    status: 'stopped',
    ip: '192.168.1.102',
    location: 'Asia Pacific',
    cpu: 2,
    memory: 4,
    disk: 40,
    usage: { cpu: 0, memory: 0, disk: 15 },
    uptime: '-',
  },
  {
    id: 4,
    name: 'Database Server',
    status: 'running',
    ip: '192.168.1.103',
    location: 'US West',
    cpu: 8,
    memory: 32,
    disk: 500,
    usage: { cpu: 56, memory: 78, disk: 62 },
    uptime: '90 days',
  },
];

const plans = [
  {
    name: 'Starter',
    price: 29,
    cpu: 2,
    memory: 4,
    disk: 40,
    bandwidth: '2 TB',
    popular: false,
  },
  {
    name: 'Professional',
    price: 79,
    cpu: 4,
    memory: 16,
    disk: 100,
    bandwidth: '5 TB',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 199,
    cpu: 8,
    memory: 32,
    disk: 500,
    bandwidth: 'Unlimited',
    popular: false,
  },
];

export default function CloudPage() {
  const [selectedPlan, setSelectedPlan] = useState('Professional');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-[var(--success)]';
      case 'stopped':
        return 'text-[var(--foreground-subtle)]';
      case 'error':
        return 'text-[var(--error)]';
      default:
        return 'text-[var(--foreground-muted)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4" />;
      case 'stopped':
        return <Clock className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Cloud Services</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            Manage your cloud infrastructure and resources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" />
            Create Server
          </button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Servers', value: '4', icon: Server, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Running', value: '3', icon: Play, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total CPU Cores', value: '16', icon: Cpu, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Memory', value: '60 GB', icon: MemoryStick, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-5"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
                <p className="text-sm text-[var(--foreground-muted)]">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Usage Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Resource Usage</h3>
              <p className="text-sm text-[var(--foreground-muted)]">Last 24 hours</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-[var(--foreground-muted)]">CPU</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-[var(--foreground-muted)]">Memory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-[var(--foreground-muted)]">Disk</span>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={usageData}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground-subtle)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground-subtle)', fontSize: 12 }} unit="%" />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCpu)" />
              <Area type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorMemory)" />
              <Area type="monotone" dataKey="disk" stroke="#f59e0b" strokeWidth={2} fill="url(#colorDisk)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Servers List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Your Servers</h3>
            <button className="text-[var(--accent-primary)] text-sm font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Server</th>
                <th>Status</th>
                <th>Location</th>
                <th>Resources</th>
                <th>Usage</th>
                <th>Uptime</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((server) => (
                <tr key={server.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center">
                        <Server className="w-5 h-5 text-[var(--accent-primary)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{server.name}</p>
                        <p className="text-sm text-[var(--foreground-muted)] font-mono">{server.ip}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`flex items-center gap-2 ${getStatusColor(server.status)}`}>
                      {getStatusIcon(server.status)}
                      <span className="capitalize">{server.status}</span>
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[var(--foreground-subtle)]" />
                      <span className="text-[var(--foreground-muted)]">{server.location}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-4 h-4 text-[var(--foreground-subtle)]" />
                        {server.cpu} vCPU
                      </span>
                      <span className="flex items-center gap-1">
                        <MemoryStick className="w-4 h-4 text-[var(--foreground-subtle)]" />
                        {server.memory} GB
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                          style={{ width: `${server.usage.cpu}%` }}
                        />
                      </div>
                      <span className="text-sm text-[var(--foreground-muted)]">{server.usage.cpu}%</span>
                    </div>
                  </td>
                  <td className="text-[var(--foreground-muted)]">{server.uptime}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      {server.status === 'running' ? (
                        <button className="btn-icon btn-ghost btn-sm" title="Stop">
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button className="btn-icon btn-ghost btn-sm" title="Start">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button className="btn-icon btn-ghost btn-sm" title="Settings">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="btn-icon btn-ghost btn-sm text-[var(--error)]" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pricing Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Select the desired service specifications</h3>
        <p className="text-[var(--foreground-muted)] mb-6">
          After creating the service, you can modify the non-required service specifications as needed.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              onClick={() => setSelectedPlan(plan.name)}
              className={`card card-interactive p-6 relative ${
                selectedPlan === plan.name ? 'border-[var(--accent-primary)] shadow-lg shadow-blue-500/10' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge badge-info">Most Popular</span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-[var(--foreground)] mb-2">{plan.name}</h4>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-[var(--foreground)]">${plan.price}</span>
                  <span className="text-[var(--foreground-muted)]">/month</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                  <span className="flex items-center gap-2 text-[var(--foreground-muted)]">
                    <Cpu className="w-4 h-4" />
                    CPU Cores
                  </span>
                  <span className="font-semibold text-[var(--foreground)]">{plan.cpu} vCPU</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                  <span className="flex items-center gap-2 text-[var(--foreground-muted)]">
                    <MemoryStick className="w-4 h-4" />
                    Memory
                  </span>
                  <span className="font-semibold text-[var(--foreground)]">{plan.memory} GB</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                  <span className="flex items-center gap-2 text-[var(--foreground-muted)]">
                    <HardDrive className="w-4 h-4" />
                    Storage
                  </span>
                  <span className="font-semibold text-[var(--foreground)]">{plan.disk} GB SSD</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-2 text-[var(--foreground-muted)]">
                    <Wifi className="w-4 h-4" />
                    Bandwidth
                  </span>
                  <span className="font-semibold text-[var(--foreground)]">{plan.bandwidth}</span>
                </div>
              </div>
              
              <button className={`btn w-full mt-6 ${
                selectedPlan === plan.name ? 'btn-primary' : 'btn-secondary'
              }`}>
                {selectedPlan === plan.name ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Create Server Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex justify-center"
      >
        <button className="btn btn-primary btn-lg">
          <Cloud className="w-5 h-5" />
          Create cloud service
        </button>
      </motion.div>
    </div>
  );
}

