import { DecryptCommand, EncryptCommand, KMSClient } from '@aws-sdk/client-kms';

import type { KmsClient, KmsDecryptResult, KmsEncryptResult } from './types.js';

export class AwsKmsEnvelopeClient implements KmsClient {
  private readonly client: KMSClient;

  constructor(args: { region?: string }) {
    this.client = new KMSClient({ region: args.region });
  }

  async encrypt(args: { keyId: string; plaintext: Buffer; aad?: Buffer }): Promise<KmsEncryptResult> {
    const out = await this.client.send(
      new EncryptCommand({
        KeyId: args.keyId,
        Plaintext: args.plaintext,
        EncryptionContext: args.aad ? { aad: args.aad.toString('base64') } : undefined,
      }),
    );

    if (!out.CiphertextBlob) {
      throw new Error('AwsKmsEnvelopeClient.encrypt: missing CiphertextBlob');
    }

    return {
      encryptedKey: Buffer.from(out.CiphertextBlob),
      keyId: out.KeyId,
    };
  }

  async decrypt(args: { ciphertext: Buffer; aad?: Buffer }): Promise<KmsDecryptResult> {
    const out = await this.client.send(
      new DecryptCommand({
        CiphertextBlob: args.ciphertext,
        EncryptionContext: args.aad ? { aad: args.aad.toString('base64') } : undefined,
      }),
    );

    if (!out.Plaintext) {
      throw new Error('AwsKmsEnvelopeClient.decrypt: missing Plaintext');
    }

    return {
      plaintextKey: Buffer.from(out.Plaintext),
      keyId: out.KeyId,
    };
  }
}


