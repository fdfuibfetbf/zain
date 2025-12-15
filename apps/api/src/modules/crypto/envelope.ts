import { randomBytes } from 'node:crypto';

import { aes256gcmDecrypt, aes256gcmEncrypt } from './aes256gcm.js';
import type { KmsClient } from './kms/types.js';

export type EnvelopeEncryptedSecret = {
  ciphertext: Buffer;
  encryptedDek: Buffer;
  iv: Buffer;
  tag: Buffer;
  aad?: unknown;
};

function aadToBuffer(aad?: unknown): Buffer | undefined {
  if (aad === undefined) return undefined;
  // Stable JSON encoding (best-effort). For stricter needs, use a canonical JSON serializer.
  return Buffer.from(JSON.stringify(aad), 'utf8');
}

export async function envelopeEncryptSecret(args: {
  kms: KmsClient;
  kmsKeyId: string;
  plaintext: string;
  aad?: unknown;
}): Promise<EnvelopeEncryptedSecret> {
  const dek = randomBytes(32);
  const aadBuf = aadToBuffer(args.aad);

  const { ciphertext, iv, tag } = aes256gcmEncrypt({
    key: dek,
    plaintext: Buffer.from(args.plaintext, 'utf8'),
    aad: aadBuf,
  });

  const kmsEncrypted = await args.kms.encrypt({
    keyId: args.kmsKeyId,
    plaintext: dek,
    aad: aadBuf,
  });

  return {
    ciphertext,
    encryptedDek: kmsEncrypted.encryptedKey,
    iv,
    tag,
    aad: args.aad,
  };
}

export async function envelopeDecryptSecret(args: {
  kms: KmsClient;
  encryptedDek: Buffer;
  ciphertext: Buffer;
  iv: Buffer;
  tag: Buffer;
  aad?: unknown;
}): Promise<string> {
  const aadBuf = aadToBuffer(args.aad);

  const kmsDecrypted = await args.kms.decrypt({
    ciphertext: args.encryptedDek,
    aad: aadBuf,
  });

  const plaintextBuf = aes256gcmDecrypt({
    key: kmsDecrypted.plaintextKey,
    ciphertext: args.ciphertext,
    iv: args.iv,
    tag: args.tag,
    aad: aadBuf,
  });

  return plaintextBuf.toString('utf8');
}


