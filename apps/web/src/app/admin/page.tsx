'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Server,
  FileText,
  ArrowRight,
  Globe,
  Cloud,
  Zap,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Cpu,
  HardDrive,
  MemoryStick,
  Wifi,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

// Chart data
const usageData = [
  { name: '1', cdn: 2400, cloud: 1800, kubernetes: 1200 },
  { name: '3', cdn: 2800, cloud: 2200, kubernetes: 1400 },
  { name: '5', cdn: 3200, cloud: 2600, kubernetes: 1800 },
  { name: '7', cdn: 2900, cloud: 2400, kubernetes: 1600 },
  { name: '9', cdn: 3800, cloud: 3200, kubernetes: 2200 },
  { name: '11', cdn: 4200, cloud: 3800, kubernetes: 2600 },
  { name: '13', cdn: 4800, cloud: 4200, kubernetes: 3000 },
  { name: '15', cdn: 5200, cloud: 4600, kubernetes: 3400 },
  { name: '17', cdn: 4600, cloud: 4000, kubernetes: 3000 },
  { name: '19', cdn: 4200, cloud: 3600, kubernetes: 2800 },
  { name: '21', cdn: 4800, cloud: 4200, kubernetes: 3200 },
  { name: '23', cdn: 5400, cloud: 4800, kubernetes: 3600 },
  { name: '25', cdn: 5800, cloud: 5200, kubernetes: 4000 },
  { name: '27', cdn: 5200, cloud: 4600, kubernetes: 3400 },
  { name: '29', cdn: 5600, cloud: 5000, kubernetes: 3800 },
];

const serviceUsageData = [
  { name: 'Jan', value: 65 },
  { name: 'Feb', value: 78 },
  { name: 'Mar', value: 82 },
  { name: 'Apr', value: 70 },
  { name: 'May', value: 85 },
  { name: 'Jun', value: 92 },
  { name: 'Jul', value: 88 },
  { name: 'Aug', value: 95 },
  { name: 'Sep', value: 80 },
  { name: 'Oct', value: 75 },
  { name: 'Nov', value: 90 },
  { name: 'Dec', value: 98 },
];

const newsItems = [
  {
    id: 1,
    title: 'Cloud Computing Center Operating...',
    category: 'News',
    time: '2h ago',
  },
  {
    id: 2,
    title: 'Amazon and Microsoft to face...',
    category: 'Update',
    time: '4h ago',
  },
  {
    id: 3,
    title: 'Commerce Cloud Computing Market 2023',
    category: 'Report',
    time: '6h ago',
  },
  {
    id: 4,
    title: 'Fears about Amazon and Microsoft cloud...',
    category: 'News',
    time: '8h ago',
  },
];

type Stats = {
  totalOrders: number;
  totalClients: number;
  totalServices: number;
  totalInvoices: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState('sms cloud service');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const statsData = await apiFetch<{ stats: Stats }>('/admin/whmcs/stats').catch(() => ({
        stats: { totalOrders: 156, totalClients: 2847, totalServices: 432, totalInvoices: 1893 },
      }));
      setStats(statsData.stats);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats?.totalOrders ?? 156,
      icon: ShoppingCart,
      trend: '+12.5%',
      trendUp: true,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Clients',
      value: stats?.totalClients ?? 2847,
      icon: Users,
      trend: '+8.2%',
      trendUp: true,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Active Services',
      value: stats?.totalServices ?? 432,
      icon: Server,
      trend: '+5.1%',
      trendUp: true,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Total Invoices',
      value: stats?.totalInvoices ?? 1893,
      icon: FileText,
      trend: '-2.3%',
      trendUp: false,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  const serviceSpecs = [
    { label: 'Estimated Hourly cost', value: '234' },
    { label: 'Engines', value: '4' },
    { label: 'Memory (GB)', value: '26', status: 'success' },
    { label: 'Price', value: '$71' },
    { label: 'CPU (Core)', value: '3.4', status: 'success' },
    { label: '$29', value: '' },
    { label: 'Disk (GB)', value: '1', status: 'warning' },
    { label: 'Free', value: '' },
    { label: 'IPv4', value: '3', status: 'success' },
    { label: '$2400', value: '' },
    { label: 'IPv6', value: '5', status: 'success' },
    { label: '', value: '' },
  ];

  if (loading && !stats) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-12 w-12 rounded-xl mb-4"></div>
              <div className="skeleton h-8 w-24 mb-2"></div>
              <div className="skeleton h-4 w-32"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6">
            <div className="skeleton h-6 w-48 mb-6"></div>
            <div className="skeleton h-64 w-full rounded-xl"></div>
          </div>
          <div className="card p-6">
            <div className="skeleton h-6 w-32 mb-6"></div>
            <div className="skeleton h-64 w-full rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`stat-card-icon ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${card.trendUp ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {card.trend}
              </div>
            </div>
            <div className="stat-card-value">{card.value.toLocaleString()}</div>
            <div className="stat-card-label">{card.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2 card"
        >
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Usage over the past 30 days</h3>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">Monitor your service usage trends</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="input text-sm py-2 px-3 w-auto"
                >
                  <option value="sms cloud service">sms cloud service</option>
                  <option value="cdn service">CDN Service</option>
                  <option value="kubernetes">Kubernetes</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#2563eb]"></div>
                <span className="text-sm text-[var(--foreground-muted)]">CDN</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#0ea5e9]"></div>
                <span className="text-sm text-[var(--foreground-muted)]">Cloud Server</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div>
                <span className="text-sm text-[var(--foreground-muted)]">Kubernetes</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="colorCdn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCloud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorKubernetes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground-subtle)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground-subtle)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Area type="monotone" dataKey="cdn" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorCdn)" />
                <Area type="monotone" dataKey="cloud" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorCloud)" />
                <Area type="monotone" dataKey="kubernetes" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorKubernetes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* News & Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">News & Trends</h3>
                <button className="text-[var(--accent-primary)] text-sm font-medium hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-2">
              {newsItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="news-item"
                >
                  <div className="news-icon">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="news-content">
                    <p className="news-title">{item.title}</p>
                    <p className="news-meta">{item.category} • {item.time}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--foreground-subtle)]" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Service Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Service usage</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={serviceUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground-subtle)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground-subtle)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Promo Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="promo-banner relative"
        >
          <span className="promo-badge">Special Offer</span>
          <h3 className="promo-title">Exclusive deals</h3>
          <p className="promo-description">
            Experience our Cloud Hosting deals with exclusive discounts
          </p>
          <button className="btn btn-primary">
            See plans
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-4 right-4 opacity-30">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
        </motion.div>

        {/* Invoice Paid / Service Specs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Invoice paid</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-[var(--foreground-muted)]">Estimated Hourly cost</div>
              <div className="text-center text-[var(--foreground-muted)]">Engines</div>
              <div className="text-right text-[var(--foreground-muted)]">Price</div>
              
              <div className="font-semibold text-[var(--foreground)]">234</div>
              <div className="text-center font-semibold text-[var(--foreground)]">4</div>
              <div className="text-right font-semibold text-[var(--foreground)]">$71</div>
              
              <div className="flex items-center gap-2">
                <MemoryStick className="w-4 h-4 text-[var(--success)]" />
                <span className="text-[var(--foreground-muted)]">Memory (GB)</span>
              </div>
              <div className="text-center font-semibold">26</div>
              <div className="text-right flex items-center justify-end gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
              </div>
              
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[var(--success)]" />
                <span className="text-[var(--foreground-muted)]">CPU (Core)</span>
              </div>
              <div className="text-center font-semibold">3.4</div>
              <div className="text-right font-semibold">$29</div>
              
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[var(--warning)]" />
                <span className="text-[var(--foreground-muted)]">Disk (GB)</span>
              </div>
              <div className="text-center font-semibold">1</div>
              <div className="text-right text-[var(--foreground-muted)]">Free</div>
              
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-[var(--success)]" />
                <span className="text-[var(--foreground-muted)]">IPv4</span>
              </div>
              <div className="text-center font-semibold">3</div>
              <div className="text-right font-semibold text-[var(--success)]">$2400</div>
            </div>
            
            <div className="divider"></div>
            
            <div className="flex items-center justify-between">
              <span className="text-[var(--foreground-muted)]">Total</span>
              <span className="text-2xl font-bold text-[var(--foreground)]">1,200 USD</span>
            </div>
            
            <button className="btn btn-primary w-full mt-4">
              <Cloud className="w-4 h-4" />
              Create cloud service
            </button>
          </div>
        </motion.div>
      </div>

      {/* Settings Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex flex-wrap gap-3"
      >
        {[
          'SSL/TLS Setting',
          'DNS Record Setting',
          'API Gateway Setting',
          'Load Balance Setting',
          'Domain management',
          'DNS Record Settings',
        ].map((setting, index) => (
          <Link
            key={setting}
            href="/admin/cdn-dns"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              index === 0
                ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-blue-500/20'
                : 'bg-[var(--surface-2)] text-[var(--foreground-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]'
            }`}
          >
            {setting}
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
