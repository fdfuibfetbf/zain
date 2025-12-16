'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mail,
  ArrowLeft,
  Cloud,
  CheckCircle,
  AlertCircle,
  Key,
  Send,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Note: This would need a forgot-password API endpoint
      // For now, simulate the request
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Simulate API call
      // await apiFetch('/auth/forgot-password', {
      //   method: 'POST',
      //   body: JSON.stringify({ email }),
      // });
      
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-8"
        >
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] mb-6 shadow-lg shadow-blue-500/20"
            >
              <Key className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Forgot Password?</h1>
            <p className="text-[var(--foreground-muted)]">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-[var(--success-soft)] border border-[var(--success)]/30"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--success)] mb-1">Reset link sent!</p>
                  <p className="text-sm text-[var(--success)]/80">
                    We've sent a password reset link to <span className="font-medium">{email}</span>. 
                    Please check your inbox and follow the instructions.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-[var(--error-soft)] border border-[var(--error)]/30"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--error)] flex-shrink-0" />
                <p className="text-sm text-[var(--error)]">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Form */}
          {!success ? (
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Email address
                </label>
                <div className="input-with-icon">
                  <Mail className="input-icon w-4 h-4" />
                  <input
                    id="email"
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-[var(--foreground-muted)] mt-2">
                  Enter the email address associated with your account
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Sending reset link...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-6 rounded-xl bg-[var(--info-soft)] border border-[var(--info)]/30">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)] mb-1">Check your email</p>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      We've sent the password reset instructions to your email address. 
                      The link will expire in 1 hour.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--surface-2)] border border-[var(--border-subtle)]">
                <p className="text-xs text-[var(--foreground-muted)] mb-2">Didn't receive the email?</p>
                <ul className="text-xs text-[var(--foreground-subtle)] space-y-1 list-disc list-inside">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email address</li>
                  <li>Wait a few minutes and try again</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                  setError(null);
                }}
                className="btn btn-secondary w-full"
              >
                <Send className="w-4 h-4" />
                Resend Reset Link
              </button>
            </motion.div>
          )}

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-primary)] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-[var(--foreground-subtle)]"
        >
          <p>
            Remember your password?{' '}
            <Link href="/login" className="text-[var(--accent-primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

