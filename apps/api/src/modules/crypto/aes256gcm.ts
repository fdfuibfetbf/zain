import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export type Aes256GcmEncrypted = {
  ciphertext: Buffer;
  iv: Buffer;
  tag: Buffer;
};

export function aes256gcmEncrypt(args: {
  key: Buffer;
  plaintext: Buffer;
  aad?: Buffer;
}): Aes256GcmEncrypted {
  if (args.key.length !== 32) {
    throw new Error('aes256gcmEncrypt: key must be 32 bytes');
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', args.key, iv);
  if (args.aad) cipher.setAAD(args.aad);

  const ciphertext = Buffer.concat([cipher.update(args.plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return { ciphertext, iv, tag };
}

export function aes256gcmDecrypt(args: {
  key: Buffer;
  ciphertext: Buffer;
  iv: Buffer;
  tag: Buffer;
  aad?: Buffer;
}): Buffer {
  if (args.key.length !== 32) {
    throw new Error('aes256gcmDecrypt: key must be 32 bytes');
  }

  const decipher = createDecipheriv('aes-256-gcm', args.key, args.iv);
  decipher.setAuthTag(args.tag);
  if (args.aad) decipher.setAAD(args.aad);

  return Buffer.concat([decipher.update(args.ciphertext), decipher.final()]);
}


