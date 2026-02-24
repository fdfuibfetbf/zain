'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    Shield,
    AlertCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const result = await apiFetch<{ role: string }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            if (result.role !== 'admin') {
                setError('Access denied. Admin credentials required.');
                return;
            }

            router.push('/admin');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid credentials');
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
                            <Shield className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Admin Sign In</h1>
                        <p className="text-[var(--foreground-muted)]">Sign in with your administrator credentials</p>
                    </div>

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
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Password
                            </label>
                            <div className="input-with-icon">
                                <Lock className="input-icon w-4 h-4" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="input pr-12"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--foreground-subtle)] hover:text-[var(--foreground)] transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
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
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Sign in to Admin
                                </>
                            )}
                        </button>
                    </form>

                    {/* Back to user panel */}
                    <div className="mt-6 text-center">
                        <a
                            href="/panel/login"
                            className="text-sm text-[var(--foreground-muted)] hover:text-[var(--accent-primary)] transition-colors"
                        >
                            ← Back to user panel
                        </a>
                    </div>
                </motion.div>

                {/* Footer note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 text-center text-xs text-[var(--foreground-subtle)]"
                >
                    <p>Admin access only. Unauthorized login attempts are logged.</p>
                </motion.div>
            </div>
        </div>
    );
}
