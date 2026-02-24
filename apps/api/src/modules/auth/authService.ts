import { createHash, randomBytes } from 'node:crypto';

import type { AuthRole } from './authTypes.js';
import { JwtService } from './jwtService.js';
import { prisma } from '../../prisma/client.js';
import { getKmsClientForKeyId } from '../crypto/kms/kmsFactory.js';
import { SecretService } from '../secrets/secretService.js';

const REFRESH_TTL_DAYS = 30;

// Demo accounts for development/testing
const DEMO_ACCOUNTS: Record<string, { password: string; role: 'admin' | 'user'; userId: number }> = {
  'admin@demo.com': { password: 'demo123', role: 'admin', userId: 1 },
  'user@demo.com': { password: 'demo123', role: 'user', userId: 2 },
};

function isDemoMode(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DEMO_MODE !== 'false';
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

function newRefreshToken(): string {
  return randomBytes(32).toString('base64url');
}

function devFallbackJwtSecret(): string | null {
  if (process.env.NODE_ENV === 'production') return null;
  return 'dev-insecure-jwt-secret-change-me';
}

export class AuthService {
  private readonly jwt = new JwtService();

  private async resolveRoleForClient(clientId: number): Promise<AuthRole> {
    const cfg = await prisma.appConfig.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton' },
      update: {},
    });

    if (!cfg.adminClientGroupId) return 'user';

    // Since WHMCS is removed, we'll need a different way to determine roles.
    // For now, we'll check if the user is in the database with a specific role,
    // or just fallback to 'user' for everything except demo admin.
    return 'user';
  }

  private async getJwtSigningSecret(): Promise<string> {
    if (isDemoMode()) {
      const dev = devFallbackJwtSecret();
      if (dev) return dev;
    }

    const row = await prisma.secret.findFirst({
      where: { scope: 'app', name: 'jwt_signing_key', isActive: true },
      orderBy: { version: 'desc' },
    });

    if (!row) {
      const dev = devFallbackJwtSecret();
      if (dev) return dev;
      throw new Error('JWT signing key missing. Configure Secret(scope=app,name=jwt_signing_key).');
    }

    const kms = await getKmsClientForKeyId(row.kmsKeyId);
    const secrets = new SecretService(kms);
    return secrets.decryptSecretValue({ secretId: row.id });
  }

  async login(args: { email: string; password: string; ip?: string; userAgent?: string }) {
    // Check for demo accounts
    const demoAccount = DEMO_ACCOUNTS[args.email.toLowerCase()];
    if (demoAccount && demoAccount.password === args.password) {
      const jwtSecret = await this.getJwtSigningSecret();
      const accessToken = await this.jwt.signAccessToken({
        whmcsUserId: demoAccount.userId,
        role: demoAccount.role
      }, jwtSecret);

      const refreshToken = `demo-refresh-${demoAccount.userId}-${Date.now()}`;

      return {
        ok: true as const,
        accessToken,
        refreshToken,
        whmcsUserId: demoAccount.userId,
        role: demoAccount.role,
      };
    }

    return { ok: false as const, reason: 'Invalid credentials or WHMCS integration disabled' };
  }

  async refresh(args: { refreshToken: string; ip?: string; userAgent?: string }) {
    if (args.refreshToken.startsWith('demo-refresh-')) {
      const parts = args.refreshToken.split('-');
      const userId = parseInt(parts[2] ?? '', 10);
      const demoAccount = Object.values(DEMO_ACCOUNTS).find(a => a.userId === userId);

      if (demoAccount) {
        const jwtSecret = await this.getJwtSigningSecret();
        const accessToken = await this.jwt.signAccessToken({
          whmcsUserId: userId,
          role: demoAccount.role
        }, jwtSecret);
        const newRefreshToken = `demo-refresh-${userId}-${Date.now()}`;

        return {
          ok: true as const,
          accessToken,
          refreshToken: newRefreshToken,
          whmcsUserId: userId,
          role: demoAccount.role
        };
      }
    }

    const refreshTokenHash = sha256Hex(args.refreshToken);
    const session = await prisma.authSession.findUnique({ where: { refreshTokenHash } });
    if (!session) return { ok: false as const, reason: 'Invalid session' };
    if (session.revokedAt) return { ok: false as const, reason: 'Session revoked' };
    if (session.expiresAt.getTime() <= Date.now()) return { ok: false as const, reason: 'Session expired' };

    const role = await this.resolveRoleForClient(session.whmcsUserId);
    const jwtSecret = await this.getJwtSigningSecret();

    const accessToken = await this.jwt.signAccessToken({ whmcsUserId: session.whmcsUserId, role }, jwtSecret);

    const newToken = newRefreshToken();
    const newHash = sha256Hex(newToken);

    await prisma.authSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: newHash,
        createdByIp: args.ip ?? session.createdByIp,
        createdByUserAgent: args.userAgent ?? session.createdByUserAgent,
      },
    });

    return { ok: true as const, accessToken, refreshToken: newToken, whmcsUserId: session.whmcsUserId, role };
  }

  async logout(args: { refreshToken: string }) {
    if (args.refreshToken.startsWith('demo-refresh-')) {
      return;
    }

    const refreshTokenHash = sha256Hex(args.refreshToken);
    await prisma.authSession.updateMany({
      where: { refreshTokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
