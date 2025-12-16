'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Shield,
  Lock,
  Key,
  CheckCircle,
  AlertCircle,
  Mail,
  Building,
  Save,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

type UserData = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  companyname: string;
  role: string;
};

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ user: UserData }>('/auth/me');
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Note: This would need an API endpoint to update user settings
      // For now, just show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
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
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </motion.div>

      {/* Status Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-[var(--error-soft)] border border-[var(--error)]/30"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--error)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[var(--error)] font-medium">Error</p>
              <p className="text-sm text-[var(--error)]/80 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-[var(--success-soft)] border border-[var(--success)]/30"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[var(--success)] font-medium">Settings saved successfully</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Account Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--info-soft)] flex items-center justify-center">
              <User className="w-5 h-5 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Account Information</h3>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">Update your account details</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSave} className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstname" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstname"
                defaultValue={user?.firstname || ''}
                className="input w-full"
                disabled
              />
            </div>
            <div>
              <label htmlFor="lastname" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastname"
                defaultValue={user?.lastname || ''}
                className="input w-full"
                disabled
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                defaultValue={user?.email || ''}
                className="input w-full"
                disabled
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Company Name
              </label>
              <input
                type="text"
                id="company"
                defaultValue={user?.companyname || ''}
                className="input w-full"
                disabled
              />
            </div>
          </div>
          <div className="pt-4 mt-6 border-t border-[var(--border-subtle)]">
            <div className="p-4 rounded-lg bg-[var(--info-soft)] border border-[var(--info)]/30">
              <p className="text-sm text-[var(--foreground-muted)]">
                To update your account information, please contact support or update it through your WHMCS client area.
              </p>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--warning-soft)] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Security</h3>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">Manage your security settings</p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--info-soft)] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[var(--foreground)]">Two-Factor Authentication</h4>
                  <p className="text-sm text-[var(--foreground-muted)] mt-1">Add an extra layer of security to your account</p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
              >
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--info-soft)] flex items-center justify-center">
                  <Key className="w-6 h-6 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[var(--foreground)]">Password</h4>
                  <p className="text-sm text-[var(--foreground-muted)] mt-1">Change your account password</p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
              >
                <Lock className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

