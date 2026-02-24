/**
 * Centralised rate-limit middleware definitions.
 *
 * Security tiers:
 *   auth       – 10 attempts / 15 min per IP  (brute-force protection)
 *   admin      – 120 req / 1 min per IP       (admin dashboard endpoints)
 *   panel      – 60 req / 1 min per IP        (user panel + /whmcs proxy)
 *   webhook    – 30 req / 1 min per IP        (webhook ingestion)
 *   global     – 300 req / 15 min per IP      (catch-all, applied in serverApp)
 */

import rateLimit from 'express-rate-limit';

/** Brute-force protection for /auth/login, /auth/register, /auth/refresh. */
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts. Please try again later.' },
    skipSuccessfulRequests: false,
});

/** Admin panel API endpoints (authenticated admins only). */
export const adminRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Admin rate limit exceeded. Please slow down.' },
    // Key by IP; once JWT auth is added, can key by admin user ID.
    keyGenerator: (req) => req.ip ?? 'unknown',
});

/** User panel and /whmcs proxy endpoints. */
export const panelRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please slow down.' },
    keyGenerator: (req) => {
        // Key by JWT whmcsUserId when available, otherwise fall back to IP.
        const userId = (req as any).auth?.whmcsUserId;
        return userId ? `user:${userId}` : (req.ip ?? 'unknown');
    },
});

/** Webhook ingestion endpoint. */
export const webhookRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Webhook rate limit exceeded.' },
    keyGenerator: (req) => req.ip ?? 'unknown',
});

/** General catch-all (applied globally in serverApp). */
export const globalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
});
