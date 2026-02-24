'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Save, Info, Home } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type StorageSetting = {
  category: string;
  storageType: string;
  path: string;
};

const STORAGE_CATEGORIES = [
  { key: 'clientFiles', label: 'Client Files', defaultPath: '/home/whmcsdem/whmcsdata/attachments' },
  { key: 'downloads', label: 'Downloads', defaultPath: '/home/whmcsdem/whmcsdata/downloads' },
  { key: 'emailAttachments', label: 'Email Attachments', defaultPath: '/home/whmcsdem/whmcsdata/attachments' },
  { key: 'emailImages', label: 'Email Images', defaultPath: '/home/whmcsdem/whmcsdata/downloads' },
  { key: 'emailTemplateAttachments', label: 'Email Template Attachments', defaultPath: '/home/whmcsdem/whmcsdata/downloads' },
  { key: 'knowledgebaseImages', label: 'Knowledgebase Images', defaultPath: '/home/whmcsdem/whmcsdata/attachments' },
  { key: 'projectManagementFiles', label: 'Project Management Files', defaultPath: '/home/whmcsdem/whmcsdata/attachments/projects' },
  { key: 'ticketAttachments', label: 'Ticket Attachments', defaultPath: '/home/whmcsdem/whmcsdata/attachments' },
];

const STORAGE_TYPES = [
  { value: 'local', label: 'Local Storage' },
  { value: 's3', label: 'Amazon S3' },
  { value: 'azure', label: 'Azure Blob Storage' },
  { value: 'gcs', label: 'Google Cloud Storage' },
];

const tabs = [
  { id: 'settings', label: 'Settings' },
  { id: 'configurations', label: 'Configurations' },
];

export default function StorageSettingsPage() {
  const [activeTab, setActiveTab] = useState('settings');
  const [settings, setSettings] = useState<Record<string, StorageSetting>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ settings: Record<string, StorageSetting> }>('/panel/storage-settings');
      const loadedSettings: Record<string, StorageSetting> = {};
      STORAGE_CATEGORIES.forEach((cat) => {
        loadedSettings[cat.key] = data.settings?.[cat.key] || {
          category: cat.label,
          storageType: 'local',
          path: cat.defaultPath,
        };
      });
      setSettings(loadedSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load storage settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const settingsToSave: Record<string, string> = {};
      Object.entries(settings).forEach(([key, setting]) => {
        settingsToSave[`${key}_type`] = setting.storageType;
        settingsToSave[`${key}_path`] = setting.path;
      });

      await apiFetch('/panel/storage-settings', {
        method: 'PUT',
        body: JSON.stringify(settingsToSave),
      });
      setStatus('Storage settings saved successfully!');
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save storage settings');
    } finally {
      setSaving(false);
    }
  }

  function updateSetting(key: string, field: 'storageType' | 'path', value: string) {
    setSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
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
        <span>Storage Settings</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Storage Settings</h1>
        <p className="text-[var(--foreground-muted)] mt-2">Configure where and how file assets are stored</p>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {/* Tabs */}
        <div className="border-b border-[var(--border-subtle)]">
          <div className="flex gap-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card-body">
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Info Banner */}
              <div className="card p-4 bg-[var(--info-bg)] border border-[var(--info)]">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[var(--info)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--info)]">
                    Changing an existing storage method will require a migration process to run in the background.
                    Depending on the number of files, this can take some time to complete.
                  </p>
                </div>
              </div>

              {/* Storage Settings List */}
              <div className="space-y-4">
                {STORAGE_CATEGORIES.map((category) => {
                  const setting = settings[category.key];
                  return (
                    <div key={category.key} className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 rounded-lg bg-[var(--surface-2)]">
                      <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                          {category.label}
                        </label>
                      </div>
                      <div className="lg:col-span-2">
                        <div className="flex gap-2">
                          <select
                            value={setting?.storageType || 'local'}
                            onChange={(e) => updateSetting(category.key, 'storageType', e.target.value)}
                            className="input flex-1"
                          >
                            {STORAGE_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={setting?.path || category.defaultPath}
                            onChange={(e) => updateSetting(category.key, 'path', e.target.value)}
                            className="input flex-1"
                            placeholder="Storage path"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'configurations' && (
            <div className="space-y-6">
              <p className="text-[var(--foreground-muted)]">
                Configure additional storage settings and connection details for cloud storage providers.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-subtle)]">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)]"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
