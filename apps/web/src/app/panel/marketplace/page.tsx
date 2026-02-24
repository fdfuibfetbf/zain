'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Home } from 'lucide-react';

export default function MarketplacePage() {
  const categories = ['All', 'Hosting', 'VPS', 'Websites', 'Domains', 'Email', 'Other'];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
        <Home className="w-4 h-4" />
        <span>-</span>
        <span>Marketplace</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Marketplace</h1>
        <p className="text-[var(--foreground-muted)] mt-1">Home - Marketplace</p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((cat, idx) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              idx === 0
                ? 'bg-[var(--accent-primary)] text-white'
                : 'bg-[var(--surface-2)] text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommended Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Recommended</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white col-span-1 md:col-span-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold mb-2">
                  New Year's sale is on - make your next move!
                </p>
                <p className="text-sm text-white/90">
                  You'll find great deals and products that serve your business all year long for you.
                </p>
              </div>
              <div className="text-6xl font-bold opacity-50">%</div>
            </div>
          </motion.div>
          {[1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-6"
            >
              <div className="space-y-3">
                <div className="w-full h-32 bg-[var(--surface-2)] rounded-lg"></div>
                <div className="h-4 bg-[var(--surface-2)] rounded w-3/4"></div>
                <div className="h-4 bg-[var(--surface-2)] rounded w-1/2"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Other Sections */}
      {['Hosting', 'VPS', 'Websites'].map((section) => (
        <div key={section} className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{section}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card p-6"
              >
                <div className="space-y-3">
                  <div className="w-full h-32 bg-[var(--surface-2)] rounded-lg"></div>
                  <div className="h-4 bg-[var(--surface-2)] rounded w-3/4"></div>
                  <div className="h-4 bg-[var(--surface-2)] rounded w-1/2"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
