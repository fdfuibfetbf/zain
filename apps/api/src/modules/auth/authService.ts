import { createHash, randomBytes } from 'node:crypto';

import type { AuthRole } from './authTypes.js';
import { JwtService } from './jwtService.js';
import { prisma } from '../../prisma/client.js';
import { WhmcsApiClient } from '../whmcs/whmcsApiClient.js';
import { createWhmcsApiClient } from '../whmcs/whmcsClientFactory.js';
import { getKmsClientForKeyId } from '../crypto/kms/kmsFactory.js';
import { SecretService } from '../secrets/secretService.js';

const REFRESH_TTL_DAYS = 30;

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

  private async getWhmcsClient(): Promise<WhmcsApiClient> {
    return createWhmcsApiClient();
  }

  private async resolveRoleForClient(clientId: number, whmcs: WhmcsApiClient): Promise<AuthRole> {
    const cfg = await prisma.appConfig.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton' },
      update: {},
    });

    if (!cfg.adminClientGroupId) return 'user';

    const details = await whmcs.getClientDetails({ clientId });
    if (details.result !== 'success') return 'user';

    const groupId = Number(details.client?.groupid ?? 0);
    return groupId === cfg.adminClientGroupId ? 'admin' : 'user';
  }

  private async getJwtSigningSecret(): Promise<string> {
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
    const whmcs = await this.getWhmcsClient();
    const res = await whmcs.validateLogin({ email: args.email, password: args.password });
    if (res.result !== 'success') {
      return { ok: false as const, reason: res.message ?? 'Invalid credentials' };
    }

    const whmcsUserId = Number(res.userid);
    if (!Number.isFinite(whmcsUserId)) {
      return { ok: false as const, reason: 'Invalid WHMCS userid response' };
    }

    const role = await this.resolveRoleForClient(whmcsUserId, whmcs);
    const jwtSecret = await this.getJwtSigningSecret();

    const accessToken = await this.jwt.signAccessToken({ whmcsUserId, role }, jwtSecret);

    const refreshToken = newRefreshToken();
    const refreshTokenHash = sha256Hex(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

    await prisma.authSession.create({
      data: {
        whmcsUserId,
        refreshTokenHash,
        expiresAt,
        createdByIp: args.ip ?? null,
        createdByUserAgent: args.userAgent ?? null,
      },
    });

    return {
      ok: true as const,
      accessToken,
      refreshToken,
      whmcsUserId,
      role,
    };
  }

  async refresh(args: { refreshToken: string; ip?: string; userAgent?: string }) {
    const refreshTokenHash = sha256Hex(args.refreshToken);
    const session = await prisma.authSession.findUnique({ where: { refreshTokenHash } });
    if (!session) return { ok: false as const, reason: 'Invalid session' };
    if (session.revokedAt) return { ok: false as const, reason: 'Session revoked' };
    if (session.expiresAt.getTime() <= Date.now()) return { ok: false as const, reason: 'Session expired' };

    const whmcs = await this.getWhmcsClient();
    const role = await this.resolveRoleForClient(session.whmcsUserId, whmcs);
    const jwtSecret = await this.getJwtSigningSecret();

    const accessToken = await this.jwt.signAccessToken({ whmcsUserId: session.whmcsUserId, role }, jwtSecret);

    // Rotate refresh token
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
    const refreshTokenHash = sha256Hex(args.refreshToken);
    await prisma.authSession.updateMany({
      where: { refreshTokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}


