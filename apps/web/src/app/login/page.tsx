'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === 'true') {
      setSuccessMessage('Account created successfully. Please sign in.');
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await apiFetch<{ role: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      window.location.href = result.role === 'admin' ? '/admin' : '/panel';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-full mb-4">
            <svg className="w-5 h-5 text-black" viewBox="0 0 76 65" fill="currentColor">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-white">Sign in to Dashboard</h1>
        </div>

        {/* Form */}
        <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-5">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#888] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-3 py-2 text-sm bg-black border border-[#333] rounded-md text-white placeholder-[#666] focus:outline-none focus:border-[#666] transition-colors"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#888] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 text-sm bg-black border border-[#333] rounded-md text-white placeholder-[#666] focus:outline-none focus:border-[#666] transition-colors pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <svg className="w-4 h-4 text-[#666] hover:text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {successMessage && (
              <div className="bg-[#0a2a0a] border border-[#0f3d0f] rounded-md px-3 py-2">
                <p className="text-xs text-[#4ade80]">{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="bg-[#2a0a0a] border border-[#3d0f0f] rounded-md px-3 py-2">
                <p className="text-xs text-[#f87171]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-[#e5e5e5] text-black text-sm font-medium py-2 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Continue'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#666] mt-4">
          Don't have an account?{' '}
          <Link href="/register" className="text-white hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
