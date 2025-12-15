'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    apiFetch('/auth/me')
      .then((data: any) => {
        setUser(data.user || {});
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const navItems = [
    { href: '/panel', label: 'Overview', icon: '📊', exact: true },
    { href: '/panel/servers', label: 'VPS Servers', icon: '🖥️' },
    { href: '/panel/services', label: 'Services', icon: '⚙️' },
    { href: '/panel/billing', label: 'Billing', icon: '💳' },
    { href: '/panel/settings', label: 'Settings', icon: '⚙️' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#58a6ff] mb-4"></div>
          <p className="text-[#8b949e]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#21262d] bg-[#161b22] backdrop-blur-sm bg-opacity-80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/panel" className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#58a6ff] to-[#8b5cf6]">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-[#f0f6fc]">Panel</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {user?.email && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-[#8b949e]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#8b5cf6] flex items-center justify-center text-white text-xs font-medium">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[#c9d1d9]">{user.email}</span>
                </div>
              )}
              <button
                onClick={() => {
                  apiFetch('/auth/logout', { method: 'POST' }).then(() => {
                    router.push('/login');
                  });
                }}
                className="px-3 py-1.5 text-sm text-[#8b949e] hover:text-[#c9d1d9] transition-colors rounded-md hover:bg-[#21262d]"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.exact
                    ? pathname === item.href
                    : pathname === item.href || (item.href !== '/panel' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                        : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Mobile Navigation */}
          <div className="lg:hidden mb-6">
            <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {navItems.map((item) => {
                const isActive =
                  item.exact
                    ? pathname === item.href
                    : pathname === item.href || (item.href !== '/panel' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                        : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22] border border-transparent'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

