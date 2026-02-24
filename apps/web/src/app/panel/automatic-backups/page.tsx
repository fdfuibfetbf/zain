'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Save, Info, TestTube, Home, Power, PowerOff } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type BackupConfiguration = {
  ftpHostname?: string;
  ftpPort?: number;
  ftpUsername?: string;
  ftpPassword?: string;
  ftpDestination?: string;
  ftpSecure?: boolean;
  ftpPassive?: boolean;
  ftpActive?: boolean;
  cpanelActive?: boolean;
  emailActive?: boolean;
};

export default function AutomaticBackupsPage() {
  const [config, setConfig] = useState<BackupConfiguration>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    loadConfiguration();
  }, []);

  async function loadConfiguration() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ configuration: BackupConfiguration }>('/panel/automatic-backups');
      setConfig(data.configuration || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load backup configuration');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      await apiFetch('/panel/automatic-backups', {
        method: 'PUT',
        body: JSON.stringify(config),
      });
      setStatus('Backup configuration saved and activated successfully!');
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save backup configuration');
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    if (!config.ftpHostname || !config.ftpUsername || !config.ftpPassword || !config.ftpDestination) {
      setError('Please fill in all required FTP fields before testing');
      return;
    }

    setTesting(true);
    setError(null);
    setStatus(null);
    try {
      const result = await apiFetch<{ success: boolean; message?: string }>('/panel/automatic-backups/test-connection', {
        method: 'POST',
        body: JSON.stringify({
          hostname: config.ftpHostname,
          port: config.ftpPort || 21,
          username: config.ftpUsername,
          password: config.ftpPassword,
          destination: config.ftpDestination,
          secure: config.ftpSecure,
          passive: config.ftpPassive,
        }),
      });

      if (result.success) {
        setStatus('Connection test successful!');
      } else {
        setError(result.message || 'Connection test failed');
      }
      setTimeout(() => {
        setStatus(null);
        setError(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test connection');
    } finally {
      setTesting(false);
    }
  }

  function updateField<K extends keyof BackupConfiguration>(field: K, value: BackupConfiguration[K]) {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48"></div>
        <div className="card p-6">
          <div className="skeleton h-64 w-full rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
        <Home className="w-4 h-4" />
        <span>-</span>
        <span>Automatic Backups</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Automatic Backups</h1>
        <p className="text-[var(--foreground-muted)] mt-2">
          We recommend taking regular backups to protect against data loss. WHMCS can perform daily automated backups of
          the database via one or more of the following methods. As a precautionary measure, you should make your own
          backups as-well.
        </p>
      </div>

      {status && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-[var(--success-bg)] border border-[var(--success)]"
        >
          <p className="text-[var(--success)] text-sm">{status}</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-[var(--error-bg)] border border-[var(--error)]"
        >
          <p className="text-[var(--error)] text-sm">{error}</p>
        </motion.div>
      )}

      {/* FTP/SFTP Backup Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-header flex items-center justify-between bg-[var(--accent-primary)] text-white">
          <h2 className="text-lg font-semibold">FTP/SFTP Backup</h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              config.ftpActive
                ? 'bg-[var(--success)] text-white'
                : 'bg-white/20 text-white'
            }`}
          >
            {config.ftpActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
        <div className="card-body">
          {/* Info Banner */}
          <div className="card p-4 bg-[var(--info-bg)] border border-[var(--info)] mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[var(--info)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--info)]">
                This backup option may fail to complete successfully with large databases due to system memory or time
                execution limits. For larger installations, we recommend using cPanel Backup or an alternative backup
                solution.{' '}
                <a href="#" className="underline font-medium">
                  Read More
                </a>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">FTP Hostname</label>
              </div>
              <div className="lg:col-span-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.ftpHostname || ''}
                    onChange={(e) => updateField('ftpHostname', e.target.value)}
                    className="input flex-1"
                    placeholder="www.example.com"
                  />
                  <input
                    type="number"
                    value={config.ftpPort || 21}
                    onChange={(e) => updateField('ftpPort', parseInt(e.target.value) || 21)}
                    className="input w-24"
                    placeholder="Port"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">FTP Username</label>
              </div>
              <div className="lg:col-span-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.ftpUsername || ''}
                    onChange={(e) => updateField('ftpUsername', e.target.value)}
                    className="input flex-1"
                    placeholder="youruser@example.com"
                  />
                  <input
                    type="password"
                    value={config.ftpPassword || ''}
                    onChange={(e) => updateField('ftpPassword', e.target.value)}
                    className="input flex-1"
                    placeholder="FTP Password"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">FTP Destination</label>
              </div>
              <div className="lg:col-span-2">
                <input
                  type="text"
                  value={config.ftpDestination || '/'}
                  onChange={(e) => updateField('ftpDestination', e.target.value)}
                  className="input w-full"
                  placeholder="/"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1"></div>
              <div className="lg:col-span-2">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.ftpSecure || false}
                      onChange={(e) => updateField('ftpSecure', e.target.checked)}
                      className="w-4 h-4 rounded border-[var(--border-subtle)]"
                    />
                    <span className="text-sm text-[var(--foreground)]">Use Secure FTP/SFTP (Recommended)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.ftpPassive || false}
                      onChange={(e) => updateField('ftpPassive', e.target.checked)}
                      className="w-4 h-4 rounded border-[var(--border-subtle)]"
                    />
                    <span className="text-sm text-[var(--foreground)]">FTP Passive Mode</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="btn btn-secondary"
              >
                <TestTube className="w-4 h-4" />
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)]"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save & Activate'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* cPanel Backup Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-header flex items-center justify-between bg-[var(--surface-2)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">cPanel Backup</h2>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--foreground-subtle)] text-white">
            INACTIVE
          </span>
        </div>
        <div className="card-body">
          <p className="text-[var(--foreground-muted)]">cPanel backup configuration will be available here.</p>
        </div>
      </motion.div>

      {/* Daily Email Backups Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-header flex items-center justify-between bg-[var(--surface-2)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Daily Email Backups</h2>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--foreground-subtle)] text-white">
            INACTIVE
          </span>
        </div>
        <div className="card-body">
          <p className="text-[var(--foreground-muted)]">Daily email backup configuration will be available here.</p>
        </div>
      </motion.div>
    </div>
  );
}
