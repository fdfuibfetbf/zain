'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Plus, Search, Filter, Star, ArrowLeftRight, Home, ExternalLink, MoreVertical, X } from 'lucide-react';
import Link from 'next/link';

export default function WebsitesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
        <Home className="w-4 h-4" />
        <span>-</span>
        <span>Websites</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Websites</h1>
          <p className="text-[var(--foreground-muted)] mt-1">Home - Websites</p>
        </div>
        <button className="btn btn-primary bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white">
          <Plus className="w-4 h-4" />
          Get hosting plan
        </button>
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

      {/* Search and Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]" />
          <input
            type="text"
            placeholder="Search by domain, email, or name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <button className="btn btn-secondary">
          <Filter className="w-4 h-4" />
        </button>
        <button className="btn btn-secondary">
          <Star className="w-4 h-4" />
        </button>
      </div>

      {/* Business Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Business</h2>
          <div className="flex items-center gap-3">
            <Link href="/panel/websites/migrations" className="text-[var(--accent-primary)] hover:underline flex items-center gap-1">
              <ArrowLeftRight className="w-4 h-4" />
              Migrate website
            </Link>
            <button className="btn btn-primary bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white">
              <Plus className="w-4 h-4" />
              Add website
            </button>
          </div>
        </div>

        {/* Warning Alert */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-[var(--error-bg)] border border-[var(--error)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--error)]/20 flex items-center justify-center">
                <span className="text-[var(--error)] text-xl">!</span>
              </div>
              <div>
                <p className="font-medium text-[var(--error)]">
                  Your hosting resource limits have been reached.
                </p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Delete unnecessary data or upgrade plan.
                </p>
              </div>
            </div>
            <button className="text-[var(--error)] hover:underline font-medium">See details</button>
          </div>
        </motion.div>

        {/* Upgrade Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-[var(--info-bg)] border border-[var(--info)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <p className="font-medium text-[var(--foreground)]">
                Upgrade to Cloud Startup and unlock more power.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-primary bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white">
                Upgrade plan
              </button>
              <button className="btn-icon btn-ghost">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Website Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--surface-2)] flex items-center justify-center">
                <span className="text-2xl">&lt;/&gt;</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--foreground)]">
                    gray-sandpiper-953914.hostingersite.com
                  </span>
                  <ExternalLink className="w-4 h-4 text-[var(--foreground-muted)]" />
                </div>
                <Link href="#" className="text-sm text-[var(--accent-primary)] hover:underline mt-1">
                  + Connect domain
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-secondary">Dashboard</button>
              <button className="btn-icon btn-ghost">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
