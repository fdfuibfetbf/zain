import { Router } from 'express';
import type { Request } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

import { AuthService } from './authService.js';
import { requireAuth } from './authMiddleware.js';
import { createWhmcsApiClient } from '../whmcs/whmcsClientFactory.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phonenumber: z.string().optional(),
  companyname: z.string().optional(),
  address1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
});

function getClientIp(req: Request): string | undefined {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string') return xff.split(',')[0]?.trim();
  return req.ip;
}

export function buildAuthRouter() {
  const router = Router();
  const auth = new AuthService();

  router.use(
    rateLimit({
      windowMs: 5 * 60 * 1000,
      limit: 40,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

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

  router.post('/register', async (req, res, next) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.issues.map((issue) => ({ field: issue.path[0], message: issue.message })),
        });
      }

      const whmcs = await createWhmcsApiClient();
      const result = await whmcs.addClient({
        firstname: parsed.data.firstname,
        lastname: parsed.data.lastname,
        email: parsed.data.email,
        password2: parsed.data.password,
        phonenumber: parsed.data.phonenumber,
        companyname: parsed.data.companyname,
        address1: parsed.data.address1,
        city: parsed.data.city,
        state: parsed.data.state,
        postcode: parsed.data.postcode,
        country: parsed.data.country,
      });

      if (result.result !== 'success') {
        return res.status(400).json({ error: result.message ?? 'Registration failed' });
      }

      const clientId = Number(result.clientid);
      if (!Number.isFinite(clientId)) {
        return res.status(500).json({ error: 'Invalid client ID received' });
      }

      // Auto-login after registration
      const loginResult = await auth.login({
        email: parsed.data.email,
        password: parsed.data.password,
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
      });

      if (!loginResult.ok) {
        return res.status(201).json({
          ok: true,
          message: 'Account created successfully. Please log in.',
          clientId,
        });
      }

      res
        .cookie('access_token', loginResult.accessToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 15 * 60 * 1000,
        })
        .cookie('refresh_token', loginResult.refreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        .json({
          ok: true,
          whmcsUserId: loginResult.whmcsUserId,
          role: loginResult.role,
          message: 'Account created and logged in successfully',
        });
    } catch (e) {
      next(e);
    }
  });

  router.get('/me', requireAuth(), async (req, res, next) => {
    try {
      if (!req.auth) return res.status(401).json({ error: 'Not authenticated' });

      // Get user details from WHMCS
      const whmcs = await createWhmcsApiClient();
      const clientDetails = await whmcs.getClientDetails({ clientId: req.auth.whmcsUserId });
      
      if (clientDetails.result === 'success' && clientDetails.client) {
        const client = clientDetails.client as any;
        return res.json({
          user: {
            id: req.auth.whmcsUserId,
            email: client.email || '',
            firstname: client.firstname || '',
            lastname: client.lastname || '',
            companyname: client.companyname || '',
            role: req.auth.role,
          },
        });
      }

      res.json({
        user: {
          id: req.auth.whmcsUserId,
          email: '',
          role: req.auth.role,
        },
      });
    } catch (e) {
      next(e);
    }
  });

  return router;
}


