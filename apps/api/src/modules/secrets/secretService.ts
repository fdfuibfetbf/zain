import { Prisma, type SecretScope } from '@prisma/client';

import { prisma } from '../../prisma/client.js';
import { envelopeDecryptSecret, envelopeEncryptSecret } from '../crypto/envelope.js';
import type { KmsClient } from '../crypto/kms/types.js';

function toBytes(buf: Buffer): Uint8Array<ArrayBuffer> {
  // Force a copy into an ArrayBuffer-backed Uint8Array (avoids ArrayBufferLike/SharedArrayBuffer typing issues).
  return Uint8Array.from(buf);
}

export class SecretService {
  constructor(private readonly kms: KmsClient) {}

  async createSecret(args: {
    scope: SecretScope;
    name: string;
    plaintext: string;
    kmsKeyId: string;
    aad?: Prisma.JsonValue;
  }) {
    const latest = await prisma.secret.findFirst({
      where: { scope: args.scope, name: args.name },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    const encrypted = await envelopeEncryptSecret({
      kms: this.kms,
      kmsKeyId: args.kmsKeyId,
      plaintext: args.plaintext,
      aad: args.aad,
    });

    return prisma.secret.create({
      data: {
        scope: args.scope,
        name: args.name,
        version: nextVersion,
        ciphertext: toBytes(encrypted.ciphertext),
        encryptedDek: toBytes(encrypted.encryptedDek),
        iv: toBytes(encrypted.iv),
        tag: toBytes(encrypted.tag),
        aad: (args.aad ?? undefined) as Prisma.InputJsonValue | undefined,
        kmsKeyId: args.kmsKeyId,
        isActive: true,
      },
    });
  }

  async rotateSecret(args: {
    secretId: string;
    plaintext: string;
    kmsKeyId: string;
    aad?: Prisma.JsonValue;
  }) {
    const existing = await prisma.secret.findUnique({ where: { id: args.secretId } });
    if (!existing) throw new Error('Secret not found');

    await prisma.secret.update({
      where: { id: existing.id },
      data: { isActive: false, rotatedAt: new Date() },
    });

    return this.createSecret({
      scope: existing.scope,
      name: existing.name,
      plaintext: args.plaintext,
      kmsKeyId: args.kmsKeyId,
      aad: args.aad,
    });
  }

  async decryptSecretValue(args: { secretId: string }): Promise<string> {
    const secret = await prisma.secret.findUnique({ where: { id: args.secretId } });
    if (!secret) throw new Error('Secret not found');
    if (!secret.isActive) throw new Error('Secret is not active');

    return envelopeDecryptSecret({
      kms: this.kms,
      encryptedDek: Buffer.from(secret.encryptedDek),
      ciphertext: Buffer.from(secret.ciphertext),
      iv: Buffer.from(secret.iv),
      tag: Buffer.from(secret.tag),
      aad: secret.aad ?? undefined,
    });
  }
}


