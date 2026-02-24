'use client';

import { motion } from 'framer-motion';
import { Layers, Home, Sparkles, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function HorizonsPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    'What is Hostinger Horizons, and how does it work?',
    'What can I build with Hostinger Horizons?',
    'How much does it cost to use Hostinger Horizons?',
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
        <Home className="w-4 h-4" />
        <span>-</span>
        <span>Horizons</span>
      </div>

      {/* Promotional Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-12 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white relative overflow-hidden"
      >
        <div className="relative z-10 max-w-2xl">
          <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-medium mb-4">
            NEW
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Go from idea to a website or web app - in minutes
          </h1>
          <p className="text-lg text-white/90 mb-6">
            Just chat with AI and go live in one click, without writing any code.
          </p>
          <button className="btn bg-white text-[var(--accent-primary)] hover:bg-gray-100 font-semibold">
            Start building
          </button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-20">
          <div className="h-full bg-white/10 rounded-l-3xl"></div>
        </div>
      </motion.div>

      {/* FAQs Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Frequently asked questions</h2>
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
