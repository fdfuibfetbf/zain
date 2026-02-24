'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Globe,
  Cloud,
  Server,
  CreditCard,
  MessageSquare,
  Code,
  Settings,
  Users,
  ShoppingCart,
  FileText,
  Ticket,
  Link2,
  FileSearch,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Home,
  Wallet,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
        if (data.user?.role !== 'admin') {
          router.push('/panel');
          return;
        }
        setUser(data.user);
      })
      .catch(() => {
        router.push('/admin/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navSections: NavSection[] = [
    {
      title: '',
      items: [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Services',
      items: [
        { href: '/admin/cdn-dns', label: 'CDN / DNS', icon: Globe },
        { href: '/admin/cloud', label: 'Cloud', icon: Cloud },
        { href: '/admin/services', label: 'RabbitMQ', icon: Server },
      ],
    },
    {
      title: 'Billing',
      items: [
        { href: '/admin/invoices', label: 'Payment', icon: CreditCard },
        { href: '/admin/transactions', label: 'SMS', icon: MessageSquare },
        { href: '/admin/products', label: 'API', icon: Code },
      ],
    },
    {
      title: 'Management',
      items: [
        { href: '/admin/clients', label: 'Clients', icon: Users },
        { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { href: '/admin/domains', label: 'Domains', icon: Globe },
        { href: '/admin/tickets', label: 'Tickets', icon: Ticket, badge: 3 },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { href: '/admin/setup', label: 'Setup', icon: Settings },
        { href: '/admin/providers', label: 'Providers', icon: Cloud },
        { href: '/admin/product-mappings', label: 'Mappings', icon: Link2 },
        { href: '/admin/logs', label: 'Audit Logs', icon: FileSearch },
      ],
    },
  ];

  const handleLogout = () => {
    apiFetch('/auth/logout', { method: 'POST' }).then(() => {
      router.push('/admin/login');
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
          <p className="text-sm text-[var(--foreground-muted)] animate-pulse">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={`nav-item ${isActive ? 'active' : ''}`}
      >
        <Icon className="nav-icon" />
        <span className="flex-1">{item.label}</span>
        {item.badge && item.badge > 0 && (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--accent-primary)] text-white">
            {item.badge}
          </span>
        )}
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
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-lg">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-[var(--foreground)]">Dashboard</span>
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
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {user?.email?.split('@')[0] || 'Alex Finger'}
                </p>
                <div className="flex items-center gap-1 text-xs text-[var(--foreground-subtle)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
                  Online
                </div>
              </div>
              <span className="text-xs font-medium text-[var(--accent-primary)] bg-[var(--info-soft)] px-2 py-1 rounded">
                1
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
            {navSections.map((section, sectionIndex) => (
              <div key={section.title || sectionIndex}>
                {section.title && (
                  <div className="nav-section-title">{section.title}</div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink key={item.href} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Wallet Section */}
          <div className="p-4 border-t border-[var(--sidebar-border)]">
            <div className="wallet-card">
              <div className="wallet-label">Wallet Balance</div>
              <div className="wallet-balance">21,345.34</div>
              <div className="wallet-currency">USD</div>
              <button className="btn btn-sm mt-4 w-full" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                <Wallet className="w-4 h-4" />
                Deposit
              </button>
            </div>
          </div>
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

              {/* Settings */}
              <button className="btn-icon btn-ghost">
                <Settings className="w-5 h-5" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-[var(--surface-2)] transition-colors"
                >
                  <div className="avatar avatar-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
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
                          <p className="text-xs text-[var(--foreground-subtle)] capitalize">{user?.role}</p>
                        </div>
                        <div className="py-1">
                          <Link href="/panel" className="dropdown-item">
                            <Home className="w-4 h-4" />
                            User Panel
                          </Link>
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
