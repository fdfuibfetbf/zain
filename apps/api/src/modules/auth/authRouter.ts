import { Router } from 'express';
import type { Request } from 'express';
import { z } from 'zod';

import { AuthService } from './authService.js';
import { requireAuth } from './authMiddleware.js';
import { authRateLimit } from '../../middleware/rateLimits.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function getClientIp(req: Request): string | undefined {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string') return xff.split(',')[0]?.trim();
  return req.ip;
}

export function buildAuthRouter() {
  const router = Router();
  const auth = new AuthService();

  router.use(authRateLimit);

  router.post('/login', async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: 'Invalid body' });

      const out = await auth.login({
        email: parsed.data.email,
        password: parsed.data.password,
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
      });

      if (!out.ok) return res.status(401).json({ error: out.reason });

      res
        .cookie('access_token', out.accessToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 15 * 60 * 1000,
        })
        .cookie('refresh_token', out.refreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        .json({ ok: true, whmcsUserId: out.whmcsUserId, role: out.role });
    } catch (e) {
      next(e);
    }
  });

  router.post('/refresh', async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refresh_token as string | undefined;
      if (!refreshToken) return res.status(401).json({ error: 'Missing refresh token' });

      const out = await auth.refresh({
        refreshToken,
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
      });
      if (!out.ok) return res.status(401).json({ error: out.reason });

      res
        .cookie('access_token', out.accessToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
        .cookie('refresh_token', out.refreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
        .json({ ok: true, whmcsUserId: out.whmcsUserId, role: out.role });
    } catch (e) {
      next(e);
    }
  });

  router.post('/logout', async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refresh_token as string | undefined;
      if (refreshToken) await auth.logout({ refreshToken });

      res
        .clearCookie('access_token')
        .clearCookie('refresh_token')
        .json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  router.get('/me', requireAuth(), async (req, res, next) => {
    try {
      if (!req.auth) return res.status(401).json({ error: 'Not authenticated' });

      // Demo users
      const demoUsers: Record<number, { email: string; firstname: string; lastname: string }> = {
        1: { email: 'admin@demo.com', firstname: 'Admin', lastname: 'User' },
        2: { email: 'user@demo.com', firstname: 'Demo', lastname: 'User' },
      };

      const demoUser = demoUsers[req.auth.whmcsUserId];
      return res.json({
        user: {
          id: req.auth.whmcsUserId,
          email: demoUser?.email || '',
          firstname: demoUser?.firstname || '',
          lastname: demoUser?.lastname || '',
          companyname: '',
          role: req.auth.role,
        },
      });
    } catch (e) {
      next(e);
    }
  });

  return router;
}
