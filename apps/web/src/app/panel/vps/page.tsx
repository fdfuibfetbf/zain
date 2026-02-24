'use client';

import { motion } from 'framer-motion';
import { Server, Home, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function VPSPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    'What is VPS Hosting?',
    "What are the Benefits of Hostinger's KVM VPS?",
    'What is a Game Panel?',
    'What are the Benefits of Hosting My Own Game Panel Hosting?',
    'What Locations are Available for VPS hosting?',
    'Will I get any kind of assistance while using Linux VPS hosting?',
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
        <Home className="w-4 h-4" />
        <span>-</span>
        <span>VPS</span>
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
        className="card p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-3">
            Build applications, host websites, or play games with VPS
          </h2>
          <p className="text-[var(--foreground-muted)]">
            Choose KVM for building applications with dedicated resources or Game Panel for hosting your favorite games.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* KVM VPS */}
          <div className="card p-6 border-2 border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {['Ubuntu', 'cPanel', 'Docker', 'NodeJS', 'CentOS', 'WordPress'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-lg bg-[var(--surface-2)] text-sm text-[var(--foreground-muted)]"
                >
                  {tech}
                </span>
              ))}
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">KVM VPS</h3>
            <p className="text-[var(--foreground-muted)] mb-4">
              Build your application or website with dedicated resources and complete control of your server
            </p>
            <button className="btn btn-secondary w-full">Get now</button>
          </div>

          {/* Game Panel */}
          <div className="card p-6 border-2 border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {['Minecraft', '7 Days to Die', 'ARK', 'Valheim'].map((game) => (
                <span
                  key={game}
                  className="px-3 py-1 rounded-lg bg-[var(--surface-2)] text-sm text-[var(--foreground-muted)]"
                >
                  {game}
                </span>
              ))}
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Game Panel</h3>
            <p className="text-[var(--foreground-muted)] mb-4">
              Host your favorite games with top-tier processors and full customization for an unbeatable gaming experience
            </p>
            <button className="btn btn-secondary w-full">Get now</button>
          </div>
        </div>
      </motion.div>

      {/* FAQs Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">VPS Hosting FAQ</h2>
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
