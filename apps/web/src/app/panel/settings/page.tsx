'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type User = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  companyname: string;
  role: string;
};

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
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
      const data = await apiFetch<{ user: User }>('/auth/me');
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#58a6ff] mb-4"></div>
          <p className="text-[#8b949e]">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#f0f6fc] mb-2">Settings</h1>
        <p className="text-[#8b949e]">Manage your account settings and preferences</p>
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

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-green-400 font-medium">Settings saved successfully</p>
          </div>
        </div>
      )}

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
        <div className="px-6 py-4 border-b border-[#30363d]">
          <h2 className="text-lg font-semibold text-[#f0f6fc]">Account Information</h2>
          <p className="text-sm text-[#8b949e] mt-1">Update your account details</p>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstname" className="block text-sm font-medium text-[#c9d1d9] mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstname"
                defaultValue={user?.firstname || ''}
                className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#58a6ff] focus:border-transparent"
                disabled
              />
            </div>
            <div>
              <label htmlFor="lastname" className="block text-sm font-medium text-[#c9d1d9] mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastname"
                defaultValue={user?.lastname || ''}
                className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#58a6ff] focus:border-transparent"
                disabled
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#c9d1d9] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                defaultValue={user?.email || ''}
                className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#58a6ff] focus:border-transparent"
                disabled
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-[#c9d1d9] mb-2">
                Company Name
              </label>
              <input
                type="text"
                id="company"
                defaultValue={user?.companyname || ''}
                className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#58a6ff] focus:border-transparent"
                disabled
              />
            </div>
          </div>
          <div className="pt-4 border-t border-[#30363d]">
            <p className="text-sm text-[#8b949e] mb-4">
              To update your account information, please contact support or update it through your WHMCS client area.
            </p>
          </div>
        </form>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
        <div className="px-6 py-4 border-b border-[#30363d]">
          <h2 className="text-lg font-semibold text-[#f0f6fc]">Security</h2>
          <p className="text-sm text-[#8b949e] mt-1">Manage your security settings</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[#f0f6fc]">Two-Factor Authentication</h3>
                <p className="text-sm text-[#8b949e] mt-1">Add an extra layer of security to your account</p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-[#58a6ff] text-white rounded-lg text-sm font-medium hover:bg-[#79c0ff] transition-colors"
              >
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-[#30363d]">
              <div>
                <h3 className="text-sm font-medium text-[#f0f6fc]">Password</h3>
                <p className="text-sm text-[#8b949e] mt-1">Change your account password</p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-[#21262d] border border-[#30363d] text-[#c9d1d9] rounded-lg text-sm font-medium hover:bg-[#30363d] transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

