'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    { href: '/panel', label: 'Overview', exact: true },
    { href: '/panel/servers', label: 'Servers' },
    { href: '/panel/services', label: 'Services' },
    { href: '/panel/billing', label: 'Billing' },
    { href: '/panel/settings', label: 'Settings' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-5 h-5 border border-[#333] border-t-white rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-[#666]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#222] bg-black sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex h-12 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/panel" className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white" viewBox="0 0 76 65" fill="currentColor">
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
              
              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-2.5 py-1 text-xs rounded transition-colors ${
                        isActive ? 'bg-[#1a1a1a] text-white' : 'text-[#888] hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              {user?.email && (
                <span className="text-xs text-[#666] hidden sm:block">{user.email}</span>
              )}
              <button
                onClick={() => {
                  apiFetch('/auth/logout', { method: 'POST' }).then(() => {
                    router.push('/login');
                  });
                }}
                className="text-xs text-[#666] hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden border-b border-[#222]">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex gap-1 py-2 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-1 text-xs rounded whitespace-nowrap transition-colors ${
                    isActive ? 'bg-[#1a1a1a] text-white' : 'text-[#888] hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
