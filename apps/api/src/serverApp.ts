import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { createRequire } from 'node:module';
import pino from 'pino';

import { buildAuthRouter } from './modules/auth/authRouter.js';
import { buildAdminRouter } from './modules/admin/adminRouter.js';
import { buildPanelRouter } from './modules/panel/panelRouter.js';
import {
  adminRateLimit,
  globalRateLimit,
  panelRateLimit,
} from './middleware/rateLimits.js';

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

  // JSON parser.
  app.use(express.json({ limit: '1mb' }));

  // Global catch-all rate limit.
  app.use(globalRateLimit);

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Auth router.
  app.use('/auth', buildAuthRouter());

  // Admin endpoints.
  app.use('/admin', adminRateLimit, buildAdminRouter());

  // User panel.
  app.use('/panel', panelRateLimit, buildPanelRouter());

  return app;
}
