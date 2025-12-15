import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createRequire } from 'node:module';
import pino from 'pino';

import { buildAuthRouter } from './modules/auth/authRouter.js';
import { buildAdminRouter } from './modules/admin/adminRouter.js';
import { buildWhmcsWebhookRouter } from './modules/whmcs/webhooks/whmcsWebhookRouter.js';
import { buildPanelRouter } from './modules/panel/panelRouter.js';

const require = createRequire(import.meta.url);
const pinoHttp = require('pino-http') as unknown as (opts?: unknown) => express.RequestHandler;

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cookieParser());

  const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean);
  app.use(
    cors({
      origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : true,
      credentials: true,
    }),
  );
  app.use(
    pinoHttp({
      logger: pino({
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
          remove: true,
        },
      }),
    }),
  );

  // Webhooks must receive the raw body for signature verification.
  app.use('/webhooks/whmcs', express.raw({ type: '*/*', limit: '2mb' }), buildWhmcsWebhookRouter());

  // JSON parser for everything else.
  app.use(express.json({ limit: '1mb' }));

  // Global rate limit (auth has stricter limits applied in its router).
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/auth', buildAuthRouter());
  app.use('/admin', buildAdminRouter());
  app.use('/panel', buildPanelRouter());

  return app;
}


