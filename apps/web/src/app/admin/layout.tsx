'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊', section: 'main' },
    { href: '/admin/clients', label: 'Clients', icon: '👥', section: 'whmcs' },
    { href: '/admin/orders', label: 'Orders', icon: '🛒', section: 'whmcs' },
    { href: '/admin/services', label: 'Services', icon: '⚙️', section: 'whmcs' },
    { href: '/admin/invoices', label: 'Invoices', icon: '🧾', section: 'whmcs' },
    { href: '/admin/products', label: 'Products', icon: '📦', section: 'whmcs' },
    { href: '/admin/domains', label: 'Domains', icon: '🌐', section: 'whmcs' },
    { href: '/admin/tickets', label: 'Tickets', icon: '🎫', section: 'whmcs' },
    { href: '/admin/transactions', label: 'Transactions', icon: '💳', section: 'whmcs' },
    { href: '/admin/setup', label: 'Setup', icon: '⚙️', section: 'config' },
    { href: '/admin/providers', label: 'Providers', icon: '🔌', section: 'config' },
    { href: '/admin/product-mappings', label: 'Product Mappings', icon: '🔗', section: 'config' },
    { href: '/admin/logs', label: 'Logs', icon: '📋', section: 'config' },
  ];

  const groupedNavItems = {
    main: navItems.filter((item) => item.section === 'main'),
    whmcs: navItems.filter((item) => item.section === 'whmcs'),
    config: navItems.filter((item) => item.section === 'config'),
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      {/* Header */}
      <header className="border-b border-[#21262d] bg-[#161b22] sticky top-0 z-50 backdrop-blur-sm bg-opacity-80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <Link href="/admin" className="text-xl font-semibold text-[#f0f6fc] hover:text-white transition-colors">
                Admin Portal
              </Link>
            </div>
            <Link
              href="/login"
              className="text-sm text-[#8b949e] hover:text-[#c9d1d9] transition-colors flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[#21262d]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Switch account
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <nav className="space-y-6">
              {/* Main Section */}
              {groupedNavItems.main.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
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

              {/* WHMCS Management Section */}
              <div>
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">WHMCS Management</h3>
                </div>
                <div className="space-y-1">
                  {groupedNavItems.whmcs.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
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
                </div>
              </div>

              {/* Configuration Section */}
              <div>
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Configuration</h3>
                </div>
                <div className="space-y-1">
                  {groupedNavItems.config.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
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
                </div>
              </div>
            </nav>
          </aside>

          {/* Mobile Navigation */}
          <div className="lg:hidden mb-4">
            <nav className="flex flex-col gap-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {groupedNavItems.main.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
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
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2 px-2">WHMCS Management</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {groupedNavItems.whmcs.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
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
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2 px-2">Configuration</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {groupedNavItems.config.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
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
                </div>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}


