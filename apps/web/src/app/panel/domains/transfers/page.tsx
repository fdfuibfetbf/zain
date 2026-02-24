'use client';

import { motion } from 'framer-motion';
import { Globe, Home, Calendar, Lock, Key, ArrowLeftRight } from 'lucide-react';
import { useState } from 'react';

export default function TransferDomainPage() {
  const [domainQuery, setDomainQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
        <Home className="w-4 h-4" />
        <span>-</span>
        <span>Domain portfolio</span>
        <span>-</span>
        <span>Transfer Domain</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Transfer Domain</h1>
        <p className="text-[var(--foreground-muted)] mt-1">Home - Domain portfolio - Transfer Domain</p>
      </div>

      {/* Transfer Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 text-center"
      >
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-[var(--surface-2)] flex items-center justify-center">
            <ArrowLeftRight className="w-10 h-10 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
              Transfer your domain to Hostinger
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type the domain you want to transfer"
                value={domainQuery}
                onChange={(e) => setDomainQuery(e.target.value)}
                className="input flex-1"
              />
              <button className="btn btn-primary bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white">
                Transfer
              </button>
            </div>
            <p className="text-sm text-[var(--foreground-muted)] mt-3">
              Transfer your .com for Rs. 2,799.00. The price includes domain renewal for a year.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Preparation Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">
          Get your domain ready for transfer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[var(--success-bg)] flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[var(--success)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--foreground)] mb-1">The domain can be transferred</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                It's been 60+ days since its registration or latest transfer.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[var(--success-bg)] flex items-center justify-center">
              <Lock className="w-6 h-6 text-[var(--success)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--foreground)] mb-1">The domain is unlocked</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Transfer lock must be off at your current provider.{' '}
                <a href="#" className="text-[var(--accent-primary)] hover:underline">
                  Here's how to unlock a domain
                </a>
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[var(--success-bg)] flex items-center justify-center">
              <Key className="w-6 h-6 text-[var(--success)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--foreground)] mb-1">You have an authorization code</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                <a href="#" className="text-[var(--accent-primary)] hover:underline">
                  Get a transfer (EPP) code from your current provider
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
