import { prisma } from '../../prisma/client.js';

export async function writeAuditLog(args: {
  actorType: 'user' | 'admin' | 'system';
  actorWhmcsId?: number | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  details?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorType: args.actorType,
      actorWhmcsId: args.actorWhmcsId ?? null,
      action: args.action,
      targetType: args.targetType,
      targetId: args.targetId ?? null,
      ip: args.ip ?? null,
      userAgent: args.userAgent ?? null,
      details: (args.details ?? {}) as any,
    },
  });
}


