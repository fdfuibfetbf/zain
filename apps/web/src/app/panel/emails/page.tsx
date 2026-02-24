'use client';

import { motion } from 'framer-motion';
import { Mail, Home, Check, X } from 'lucide-react';

export default function EmailsPage() {
  const plans = [
    {
      name: 'Starter Business Email',
      popular: true,
      description: 'For small businesses who need a reliable security and easy to use email solution.',
      originalPrice: 'Rs. 199.00/mo',
      currentPrice: 'Rs. 99.00/mo',
      discount: '50% OFF',
      features: [
        { text: '10 GB Storage per Mailbox', included: true },
        { text: '10 Forwarding Rules', included: true },
        { text: '10 Email Aliases', included: true },
        { text: '1000 emails/day per Mailbox', included: true },
        { text: 'AI tools (limited)', included: true },
        { text: 'Encrypted storage', included: true },
        { text: 'No Hostinger signature in Webmail', included: false },
        { text: 'Free domain', included: false },
      ],
    },
    {
      name: 'Premium Business Email',
      popular: false,
      description: 'For scaling businesses who need plenty of storage.',
      originalPrice: 'Rs. 599.00/mo',
      currentPrice: 'Rs. 299.00/mo',
      discount: '50% OFF',
      features: [
        { text: '50 GB Storage per Mailbox', included: true },
        { text: '50 Email Aliases', included: true },
        { text: '3000 emails/day', included: true },
        { text: 'AI tools (unlimited)', included: true },
        { text: 'Encrypted storage', included: true },
      ],
    },
    {
      name: 'Starter Google Workspace',
      popular: false,
      description: 'For entrepreneurs wanting to boost productivity and transform teamwork.',
      originalPrice: 'Rs. 2,999.00/mo',
      currentPrice: 'Rs. 1,999.00/mo',
      discount: '30% OFF',
      features: [
        { text: '30 GB Storage per Mailbox', included: true },
        { text: 'Gmail', included: true },
        { text: 'Calendar', included: true },
        { text: 'Docs, Sheets, Slides', included: true },
        { text: '24/7 support from Google Workspace experts', included: true },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
        <Home className="w-4 h-4" />
        <span>-</span>
        <span>Emails</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Select Your Email Plan</h1>
      </div>

      {/* Promotional Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-gradient-to-r from-[var(--accent-primary-light)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20"
      >
        <p className="text-lg font-semibold text-[var(--foreground)]">
          New Year's sale is on - make your next move!
        </p>
      </motion.div>

      {/* Billing Period */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-[var(--foreground)]">Choose billing period:</label>
        <select className="input w-40">
          <option>12 Months</option>
          <option>24 Months</option>
          <option>36 Months</option>
        </select>
      </div>

      {/* Email Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card p-6 relative"
          >
            {plan.popular && (
              <div className="absolute top-0 left-0 right-0 bg-[var(--accent-primary)] text-white text-center py-2 text-xs font-bold rounded-t-lg">
                MOST POPULAR
              </div>
            )}
            <div className={plan.popular ? 'pt-8' : ''}>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">{plan.name}</h3>
                <p className="text-sm text-[var(--foreground-muted)]">{plan.description}</p>
              </div>
              <div className="text-center mb-6">
                <p className="text-sm text-[var(--foreground-muted)] line-through">{plan.originalPrice}</p>
                <p className="text-3xl font-bold text-[var(--accent-primary)]">{plan.currentPrice}</p>
                <p className="text-sm text-[var(--success)] font-medium">{plan.discount}</p>
              </div>
              <button
                className={`w-full mb-6 ${
                  plan.popular
                    ? 'btn btn-primary bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white'
                    : 'btn btn-secondary'
                }`}
              >
                Get started
              </button>
              <div className="space-y-2">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-[var(--success)] flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-[var(--foreground-muted)] flex-shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-[var(--foreground)]' : 'text-[var(--foreground-muted)] line-through'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
