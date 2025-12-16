'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ user: { email: string; role: string } }>('/auth/me')
      .then((data) => {
        if (data.user?.role !== 'admin') {
          router.push('/panel');
          return;
        }
        setUser(data.user);
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const navItems = [
    { href: '/admin', label: 'Dashboard', section: 'main' },
    { href: '/admin/clients', label: 'Clients', section: 'whmcs' },
    { href: '/admin/orders', label: 'Orders', section: 'whmcs' },
    { href: '/admin/services', label: 'Services', section: 'whmcs' },
    { href: '/admin/invoices', label: 'Invoices', section: 'whmcs' },
    { href: '/admin/products', label: 'Products', section: 'whmcs' },
    { href: '/admin/domains', label: 'Domains', section: 'whmcs' },
    { href: '/admin/tickets', label: 'Tickets', section: 'whmcs' },
    { href: '/admin/transactions', label: 'Transactions', section: 'whmcs' },
    { href: '/admin/setup', label: 'Setup', section: 'config' },
    { href: '/admin/providers', label: 'Providers', section: 'config' },
    { href: '/admin/product-mappings', label: 'Mappings', section: 'config' },
    { href: '/admin/logs', label: 'Logs', section: 'config' },
  ];

  const groupedNavItems = {
    main: navItems.filter((item) => item.section === 'main'),
    whmcs: navItems.filter((item) => item.section === 'whmcs'),
    config: navItems.filter((item) => item.section === 'config'),
  };

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

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const isActive = pathname === href || (href !== '/admin' && pathname?.startsWith(href));
    return (
      <Link
        href={href}
        className={`block px-2 py-1.5 text-xs rounded transition-colors ${
          isActive ? 'bg-[#1a1a1a] text-white' : 'text-[#888] hover:text-white hover:bg-[#111]'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#222] bg-black sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex h-12 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white" viewBox="0 0 76 65" fill="currentColor">
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
                <span className="text-sm font-medium">Admin</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {user?.email && (
                <span className="text-xs text-[#666]">{user.email}</span>
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

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-44 flex-shrink-0 hidden lg:block">
            <nav className="space-y-4 sticky top-16">
              {/* Main */}
              <div>
                {groupedNavItems.main.map((item) => (
                  <NavLink key={item.href} href={item.href} label={item.label} />
                ))}
              </div>

              {/* WHMCS */}
              <div>
                <p className="px-2 text-[10px] font-medium text-[#666] uppercase tracking-wider mb-1">Management</p>
                <div className="space-y-0.5">
                  {groupedNavItems.whmcs.map((item) => (
                    <NavLink key={item.href} href={item.href} label={item.label} />
                  ))}
                </div>
              </div>

              {/* Config */}
              <div>
                <p className="px-2 text-[10px] font-medium text-[#666] uppercase tracking-wider mb-1">Configuration</p>
                <div className="space-y-0.5">
                  {groupedNavItems.config.map((item) => (
                    <NavLink key={item.href} href={item.href} label={item.label} />
                  ))}
                </div>
              </div>
            </nav>
          </aside>

          {/* Mobile Navigation */}
          <div className="lg:hidden mb-4 w-full">
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-2 py-1 text-xs rounded whitespace-nowrap transition-colors ${
                      isActive ? 'bg-[#1a1a1a] text-white' : 'text-[#888] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
