'use client';

import { motion } from 'framer-motion';
import { Globe, Home, Search, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function GetNewDomainPage() {
  const [domainQuery, setDomainQuery] = useState('');

  const popularTlds = [
    { tld: '.com', original: 'Rs. 3,999.00', current: 'Rs. 99.00' },
    { tld: '.net', original: 'Rs. 5,099.00', current: 'Rs. 3,490.00' },
    { tld: '.io', original: 'Rs. 10,999.00', current: 'Rs. 8,999.00' },
    { tld: '.org', original: 'Rs. 4,499.00', current: 'Rs. 2,299.00' },
    { tld: '.online', original: 'Rs. 10,099.00', current: 'Rs. 299.00' },
    { tld: '.shop', original: 'Rs. 9,799.00', current: 'Rs. 299.00' },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
        <Home className="w-4 h-4" />
        <span>-</span>
        <span>Domain portfolio</span>
        <span>-</span>
        <span>Get a new domain</span>
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
              New Year deal: Get domain + free business email
            </p>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              Choose a domain with .ai, .io, .net, or .org for 2 years or longer and get 1 year of free email.
            </p>
          </div>
          <div className="text-6xl font-bold text-[var(--accent-primary)] opacity-50">%</div>
        </div>
      </motion.div>

      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Get a New Domain</h1>
      </div>

      {/* Domain Search Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3">
          <button className="btn btn-primary bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white">
            Find new domain
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
            Generate domain using AI
          </button>
        </div>

        <p className="text-center text-[var(--foreground-muted)]">
          Type your desired domain name into the domain checker search bar and find out if it's available instantly!
        </p>

        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Enter your desired domain name"
              value={domainQuery}
              onChange={(e) => setDomainQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <button className="btn btn-primary bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white">
            Search
          </button>
        </div>
      </div>

      {/* Popular TLDs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Popular Domain Extensions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularTlds.map((tld, idx) => (
            <motion.div
              key={tld.tld}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-[var(--foreground)]">{tld.tld}</p>
                <div>
                  <p className="text-sm text-[var(--foreground-muted)] line-through">{tld.original}</p>
                  <p className="text-xl font-bold text-[var(--accent-primary)]">{tld.current}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
