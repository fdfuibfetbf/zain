'use client';

import { motion } from 'framer-motion';
import { Globe, Home, Plus, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';

export default function DomainsPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
        <Home className="w-4 h-4" />
        <span>-</span>
        <span>Domain portfolio</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Domain portfolio</h1>
        <p className="text-[var(--foreground-muted)] mt-1">Home - Domain portfolio</p>
      </div>

      {/* Promotional Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-gradient-to-r from-[var(--accent-primary-light)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-[var(--foreground)]">
              New Year's sale is on - make your next move!
            </p>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              Grab these great deals that we've handpicked just for you.
            </p>
          </div>
          <div className="text-6xl font-bold text-[var(--accent-primary)] opacity-50">%</div>
        </div>
      </motion.div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-12 text-center"
      >
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-[var(--surface-2)] flex items-center justify-center">
            <Search className="w-12 h-12 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Get a domain to get your website online
            </h2>
            <p className="text-[var(--foreground-muted)]">
              Register a new domain or transfer a domain you already own.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/panel/domains/new"
              className="btn btn-primary bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white"
            >
              <Plus className="w-4 h-4" />
              Get new domain
            </Link>
            <Link
              href="/panel/domains/transfers"
              className="text-[var(--accent-primary)] hover:underline font-medium"
            >
              Transfer domain
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
