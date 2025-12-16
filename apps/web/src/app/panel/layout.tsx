'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Server,
  Package,
  CreditCard,
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Cloud,
  Bell,
  Search,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    apiFetch<{ user: { email: string; role: string } }>('/auth/me')
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navItems: NavItem[] = [
    { href: '/panel', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/panel/servers', label: 'Servers', icon: Server },
    { href: '/panel/services', label: 'Services', icon: Package },
    { href: '/panel/billing', label: 'Billing', icon: CreditCard },
    { href: '/panel/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    apiFetch('/auth/logout', { method: 'POST' }).then(() => {
      router.push('/login');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--border-subtle)]"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--accent-primary)] animate-spin"></div>
          </div>
          <p className="text-sm text-[var(--foreground-muted)] animate-pulse">Loading panel...</p>
        </div>
      </div>
    );
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = item.exact
      ? pathname === item.href
      : pathname === item.href || (item.href !== '/panel' && pathname?.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={`nav-item ${isActive ? 'active' : ''}`}
      >
        <Icon className="nav-icon" />
        <span className="flex-1">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-[var(--sidebar-border)]">
            <Link href="/panel" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-lg">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-[var(--foreground)]">User Panel</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-b border-[var(--sidebar-border)]">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-2)]">
              <div className="avatar">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <div className="flex items-center gap-1 text-xs text-[var(--foreground-subtle)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
                  Online
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content area */}
      <div className="admin-main flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--background)] border-b border-[var(--border-subtle)]">
          <div className="h-full px-4 lg:px-8 flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search */}
              <div className="hidden md:block relative">
                <div className="input-with-icon">
                  <Search className="input-icon w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input w-[300px]"
                  />
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="btn-icon btn-ghost relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--error)]"></span>
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-[var(--surface-2)] transition-colors"
                >
                  <div className="avatar avatar-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-[var(--foreground-muted)]" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="dropdown"
                      >
                        <div className="p-3 border-b border-[var(--border-subtle)]">
                          <p className="text-sm font-medium text-[var(--foreground)] truncate">{user?.email}</p>
                          <p className="text-xs text-[var(--foreground-subtle)] capitalize">{user?.role || 'user'}</p>
                        </div>
                        <div className="py-1">
                          <button onClick={handleLogout} className="dropdown-item w-full text-[var(--error)]">
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-[1600px] mx-auto"
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--border-subtle)] py-4 px-4 lg:px-8">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--foreground-subtle)]">
            <p>© {new Date().getFullYear()} Cloud Dashboard. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-[var(--accent-primary)]">Privacy Policy</Link>
              <Link href="#" className="hover:text-[var(--accent-primary)]">Terms of Service</Link>
              <span>Version 2.0.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
