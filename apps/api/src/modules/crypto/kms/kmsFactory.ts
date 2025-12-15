import { prisma } from '../../../prisma/client.js';
import { AwsKmsEnvelopeClient } from './awsKmsClient.js';
import type { KmsClient } from './types.js';

export async function getKmsClientForKeyId(kmsKeyId: string): Promise<KmsClient> {
  const key = await prisma.kmsKey.findUnique({ where: { id: kmsKeyId } });
  if (!key) {
    throw new Error('KMS key not found');
  }

  switch (key.provider) {
    case 'aws':
      return new AwsKmsEnvelopeClient({ region: key.region ?? undefined });
    case 'gcp':
    case 'azure':
      throw new Error(`KMS provider not implemented yet: ${key.provider}`);
  }
}


