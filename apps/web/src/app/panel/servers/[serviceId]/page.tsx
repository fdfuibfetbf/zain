'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

type Service = {
  serviceId: number;
  productId: number;
  name: string;
  status: string;
  domain?: string;
  amount?: string;
  currency?: string;
  nextduedate?: string;
};

type Server = {
  id: string;
  status: string;
  ip?: string;
  region?: string;
  providerResourceId: string;
  provider: string;
  providerType: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
};

type Action = {
  id: string;
  action: string;
  status: string;
  requestedAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
};

export default function ServerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = Number(params.serviceId);
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'monitoring' | 'history'>('overview');
  const [service, setService] = useState<Service | null>(null);
  const [server, setServer] = useState<Server | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (serviceId) {
      loadServerDetails();
      if (activeTab === 'history') {
        loadActions();
      }
    }
  }, [serviceId, activeTab]);

  async function loadServerDetails() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ service: Service; server: Server | null; actions: Action[] }>(
        `/panel/services/${serviceId}`
      );
      setService(data.service);
      setServer(data.server);
      setActions(data.actions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load server details');
    } finally {
      setLoading(false);
    }
  }

  async function loadActions() {
    try {
      const data = await apiFetch<{ actions: Action[] }>(`/panel/services/${serviceId}/actions`);
      setActions(data.actions || []);
    } catch (err) {
      console.error('Failed to load actions:', err);
    }
  }

  async function runAction(action: string) {
    if (!server) return;
    
    setActionLoading(action);
    setError(null);
    try {
      await apiFetch(`/panel/services/${serviceId}/actions`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      await loadServerDetails();
      if (activeTab === 'history') {
        await loadActions();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (statusLower === 'suspended' || statusLower === 'stopped') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (statusLower === 'pending' || statusLower === 'provisioning') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    if (statusLower === 'succeeded') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (statusLower === 'failed') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (statusLower === 'running') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#58a6ff] mb-4"></div>
          <p className="text-[#8b949e]">Loading server details...</p>
        </div>
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-red-400 font-medium">Error loading server</p>
            <p className="text-sm text-red-300/80 mt-1">{error}</p>
          </div>
        </div>
        <Link
          href="/panel/servers"
          className="inline-flex items-center text-sm text-[#58a6ff] hover:text-[#79c0ff]"
        >
          ← Back to Servers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/panel/servers"
            className="inline-flex items-center text-sm text-[#8b949e] hover:text-[#c9d1d9] mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Servers
          </Link>
          <h1 className="text-3xl font-bold text-[#f0f6fc] mb-2">{service?.name || 'Server Details'}</h1>
          <p className="text-[#8b949e]">Service #{serviceId}</p>
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
            <p className="text-sm text-red-400 font-medium">Error</p>
            <p className="text-sm text-red-300/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <div className="border-b border-[#30363d] flex overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'actions', label: 'Actions', icon: '⚡' },
            { id: 'monitoring', label: 'Monitoring', icon: '📈' },
            { id: 'history', label: 'History', icon: '📋' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#58a6ff] border-[#58a6ff] bg-[#0d1117]'
                  : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9] hover:border-[#30363d]'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab service={service} server={server} getStatusColor={getStatusColor} formatDate={formatDate} />}
          {activeTab === 'actions' && (
            <ActionsTab
              server={server}
              runAction={runAction}
              actionLoading={actionLoading}
              getStatusColor={getStatusColor}
            />
          )}
          {activeTab === 'monitoring' && <MonitoringTab server={server} />}
          {activeTab === 'history' && (
            <HistoryTab actions={actions} getStatusColor={getStatusColor} formatDate={formatDate} />
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({
  service,
  server,
  getStatusColor,
  formatDate,
}: {
  service: Service | null;
  server: Server | null;
  getStatusColor: (status: string) => string;
  formatDate: (date: string) => string;
}) {
  if (!service) return null;

  return (
    <div className="space-y-6">
      {/* Server Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-[#8b949e] mb-4 uppercase tracking-wide">Server Information</h3>
          <div className="space-y-4">
            {server ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8b949e]">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(server.status)}`}>
                    {server.status}
                  </span>
                </div>
                {server.ip && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#8b949e]">IP Address</span>
                    <span className="text-sm font-mono text-[#c9d1d9]">{server.ip}</span>
                  </div>
                )}
                {server.region && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#8b949e]">Region</span>
                    <span className="text-sm text-[#c9d1d9]">{server.region}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8b949e]">Provider</span>
                  <span className="text-sm text-[#c9d1d9]">{server.provider}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8b949e]">Resource ID</span>
                  <span className="text-sm font-mono text-[#8b949e] text-xs">{server.providerResourceId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8b949e]">Created</span>
                  <span className="text-sm text-[#c9d1d9]">{formatDate(server.createdAt)}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <svg className="w-4 h-4 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-yellow-400">Server not provisioned yet</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-[#8b949e] mb-4 uppercase tracking-wide">Service Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#8b949e]">Service Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                {service.status}
              </span>
            </div>
            {service.domain && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8b949e]">Domain</span>
                <span className="text-sm text-[#c9d1d9]">{service.domain}</span>
              </div>
            )}
            {service.amount && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8b949e]">Amount</span>
                <span className="text-sm text-[#c9d1d9]">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: service.currency || 'USD',
                  }).format(parseFloat(service.amount))}
                </span>
              </div>
            )}
            {service.nextduedate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8b949e]">Next Due Date</span>
                <span className="text-sm text-[#c9d1d9]">{formatDate(service.nextduedate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionsTab({
  server,
  runAction,
  actionLoading,
  getStatusColor,
}: {
  server: Server | null;
  runAction: (action: string) => void;
  actionLoading: string | null;
  getStatusColor: (status: string) => string;
}) {
  const actions = [
    { id: 'reboot', label: 'Reboot Server', icon: '🔄', description: 'Restart the server', color: 'from-blue-500 to-cyan-500' },
    { id: 'power_on', label: 'Power On', icon: '▶️', description: 'Start the server', color: 'from-green-500 to-emerald-500' },
    { id: 'power_off', label: 'Power Off', icon: '⏸️', description: 'Stop the server', color: 'from-yellow-500 to-orange-500' },
    { id: 'reinstall', label: 'Reinstall OS', icon: '🔧', description: 'Reinstall operating system', color: 'from-purple-500 to-pink-500' },
    { id: 'suspend', label: 'Suspend', icon: '⏸️', description: 'Suspend the server', color: 'from-red-500 to-rose-500' },
  ];

  if (!server) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-4">
          <svg className="w-4 h-4 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm text-yellow-400">Server must be provisioned to perform actions</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#f0f6fc] mb-2">Server Actions</h3>
        <p className="text-sm text-[#8b949e]">Perform actions on your VPS server</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => runAction(action.id)}
            disabled={actionLoading !== null || server.status === 'suspended' || server.status === 'terminated'}
            className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6 hover:border-[#58a6ff]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <span className="text-2xl">{action.icon}</span>
            </div>
            <h4 className="text-base font-semibold text-[#f0f6fc] mb-1">{action.label}</h4>
            <p className="text-sm text-[#8b949e]">{action.description}</p>
            {actionLoading === action.id && (
              <div className="mt-4 flex items-center text-sm text-[#58a6ff]">
                <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-yellow-400 font-medium">Warning</p>
            <p className="text-sm text-yellow-300/80 mt-1">
              Some actions may cause temporary downtime. Please ensure you have saved your work before proceeding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonitoringTab({ server }: { server: Server | null }) {
  if (!server) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-4">
          <span className="text-sm text-yellow-400">Server must be provisioned to view monitoring data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#f0f6fc] mb-2">Server Monitoring</h3>
        <p className="text-sm text-[#8b949e]">Real-time server metrics and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="CPU Usage" value="45%" color="from-blue-500 to-cyan-500" />
        <MetricCard title="Memory Usage" value="62%" color="from-green-500 to-emerald-500" />
        <MetricCard title="Disk Usage" value="38%" color="from-purple-500 to-pink-500" />
        <MetricCard title="Network I/O" value="1.2 GB/s" color="from-orange-500 to-red-500" />
      </div>

      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6">
        <h4 className="text-sm font-semibold text-[#8b949e] mb-4 uppercase tracking-wide">Resource Usage</h4>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#c9d1d9]">CPU</span>
              <span className="text-sm text-[#8b949e]">45%</span>
            </div>
            <div className="w-full bg-[#21262d] rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '45%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#c9d1d9]">Memory</span>
              <span className="text-sm text-[#8b949e]">62%</span>
            </div>
            <div className="w-full bg-[#21262d] rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '62%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#c9d1d9]">Disk</span>
              <span className="text-sm text-[#8b949e]">38%</span>
            </div>
            <div className="w-full bg-[#21262d] rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '38%' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6">
        <h4 className="text-sm font-semibold text-[#8b949e] mb-4 uppercase tracking-wide">Network Statistics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#8b949e] mb-1">Inbound Traffic</p>
            <p className="text-lg font-semibold text-[#f0f6fc]">2.4 TB</p>
          </div>
          <div>
            <p className="text-xs text-[#8b949e] mb-1">Outbound Traffic</p>
            <p className="text-lg font-semibold text-[#f0f6fc]">1.8 TB</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
      <p className="text-xs text-[#8b949e] mb-2">{title}</p>
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold text-[#f0f6fc]">{value}</p>
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} opacity-20`} />
      </div>
    </div>
  );
}

function HistoryTab({
  actions,
  getStatusColor,
  formatDate,
}: {
  actions: Action[];
  getStatusColor: (status: string) => string;
  formatDate: (date: string) => string;
}) {
  if (actions.length === 0) {
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-[#8b949e]">No action history found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[#f0f6fc] mb-2">Action History</h3>
        <p className="text-sm text-[#8b949e]">View all actions performed on this server</p>
      </div>

      <div className="space-y-2">
        {actions.map((action) => (
          <div
            key={action.id}
            className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 hover:border-[#30363d] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#21262d] flex items-center justify-center">
                  <span className="text-lg">
                    {action.action === 'reboot' && '🔄'}
                    {action.action === 'power_on' && '▶️'}
                    {action.action === 'power_off' && '⏸️'}
                    {action.action === 'reinstall' && '🔧'}
                    {action.action === 'suspend' && '⏸️'}
                    {action.action === 'terminate' && '🗑️'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f0f6fc] capitalize">{action.action.replace('_', ' ')}</p>
                  <p className="text-xs text-[#8b949e]">{formatDate(action.requestedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(action.status)}`}>
                  {action.status}
                </span>
              </div>
            </div>
            {action.error && (
              <div className="mt-3 pt-3 border-t border-[#21262d]">
                <p className="text-xs text-red-400">{action.error}</p>
              </div>
            )}
            {action.completedAt && (
              <div className="mt-2 text-xs text-[#8b949e]">
                Completed: {formatDate(action.completedAt)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

