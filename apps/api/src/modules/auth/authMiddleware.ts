import type { Request, Response, NextFunction } from 'express';

import { JwtService } from './jwtService.js';
import type { AuthClaims, AuthRole } from './authTypes.js';
import { prisma } from '../../prisma/client.js';
import { getKmsClientForKeyId } from '../crypto/kms/kmsFactory.js';
import { SecretService } from '../secrets/secretService.js';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthClaims;
    }
  }
}

async function loadJwtSecret(): Promise<string> {
  const row = await prisma.secret.findFirst({
    where: { scope: 'app', name: 'jwt_signing_key', isActive: true },
    orderBy: { version: 'desc' },
  });
  if (!row) {
    if (process.env.NODE_ENV !== 'production') return 'dev-insecure-jwt-secret-change-me';
    throw new Error('JWT signing key missing');
  }
  const kms = await getKmsClientForKeyId(row.kmsKeyId);
  const secrets = new SecretService(kms);
  return secrets.decryptSecretValue({ secretId: row.id });
}

export function requireAuth() {
  const jwt = new JwtService();

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        (req.cookies?.access_token as string | undefined) ??
        (typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')
          ? req.headers.authorization.slice('Bearer '.length)
          : undefined);

      if (!token) return res.status(401).json({ error: 'Missing access token' });

      const secret = await loadJwtSecret();
      const claims = jwt.verifyAccessToken(token, secret);
      req.auth = claims;
      next();
    } catch (_e) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

export function requireRole(role: AuthRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
    if (req.auth.role !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}


