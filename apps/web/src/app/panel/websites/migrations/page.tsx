'use client';

import { motion } from 'framer-motion';
import { ArrowLeftRight, Home, Globe, User, Database, RefreshCw, Clock, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function MigrationsPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    'How to fill out a website migration request?',
    'How long does it take to migrate a website?',
    'My services with the previous provider are expiring soon. Can I ask for priority?',
    'Can I add a link with backups for you to migrate?',
    'Can I request to migrate a website from another Hostinger account?',
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
        <Home className="w-4 h-4" />
        <span>-</span>
        <span>Websites</span>
        <span>-</span>
        <span>Migrations</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Migrations</h1>
        <p className="text-[var(--foreground-muted)] mt-1">Home - Websites - Migrations</p>
      </div>

      {/* Main Migration Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8"
      >
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
                Migrate your site from another provider - it's free
              </h2>
              <p className="text-[var(--foreground-muted)]">
                Just share a few details about your site - and we'll do the rest. Your site will stay up and running the whole time.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "It's a quick and automatic process",
                'Use your admin login details or backup files to migrate',
                'Pick a domain you want to use for your site',
                'You can migrate subdomains and sub-directories too',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--success)] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-[var(--foreground)]">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button className="btn btn-primary bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white">
                <ArrowLeftRight className="w-4 h-4" />
                Migrate website
              </button>
              <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  Usually takes <strong>30 minutes</strong>, but may take 24 hours.
                </span>
              </div>
            </div>
          </div>

          {/* Flow Diagram */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-4">
              <div className="space-y-3">
                <div className="w-32 p-4 rounded-lg border-2 border-[var(--accent-primary)] bg-[var(--accent-primary)]/5">
                  <Globe className="w-6 h-6 text-[var(--accent-primary)] mb-2" />
                  <p className="text-sm font-medium text-[var(--foreground)]">Website URL</p>
                </div>
                <div className="w-32 p-4 rounded-lg border-2 border-[var(--accent-primary)] bg-[var(--accent-primary)]/5">
                  <User className="w-6 h-6 text-[var(--accent-primary)] mb-2" />
                  <p className="text-sm font-medium text-[var(--foreground)]">Login details</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <ArrowLeftRight className="w-6 h-6 text-[var(--foreground-muted)]" />
                <ArrowLeftRight className="w-6 h-6 text-[var(--foreground-muted)]" />
              </div>
              <div className="space-y-3">
                <div className="w-32 p-4 rounded-lg border-2 border-[var(--success)] bg-[var(--success-bg)]">
                  <RefreshCw className="w-6 h-6 text-[var(--success)] mb-2" />
                  <p className="text-sm font-medium text-[var(--foreground)]">Backup</p>
                </div>
                <div className="w-32 p-4 rounded-lg border-2 border-[var(--success)] bg-[var(--success-bg)]">
                  <Database className="w-6 h-6 text-[var(--success)] mb-2" />
                  <p className="text-sm font-medium text-[var(--foreground)]">Database</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FAQs Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">FAQs</h2>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card p-4 cursor-pointer hover:bg-[var(--surface-hover)] transition-colors"
              onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--foreground)]">{faq}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[var(--accent-primary)] transition-transform ${
                    expandedFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </div>
              {expandedFaq === idx && (
                <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] text-[var(--foreground-muted)]">
                  <p>Answer to the question will appear here...</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
