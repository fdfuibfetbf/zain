import { prisma } from '../../prisma/client.js';
import { getKmsClientForKeyId } from '../crypto/kms/kmsFactory.js';
import { SecretService } from '../secrets/secretService.js';
import { WhmcsApiClient } from './whmcsApiClient.js';

export async function createWhmcsApiClient(): Promise<WhmcsApiClient> {
  const conn = await prisma.whmcsConnection.findFirst({
    where: { status: 'connected' },
    select: { baseUrl: true, apiIdentifier: true, apiSecretSecretId: true },
  });
  if (!conn?.apiSecretSecretId) {
    throw new Error('WHMCS connection is not configured (missing api secret)');
  }

  const secretRow = await prisma.secret.findUnique({ where: { id: conn.apiSecretSecretId } });
  if (!secretRow) throw new Error('WHMCS API secret not found');
  if (!secretRow.isActive) throw new Error('WHMCS API secret is not active');

  const kms = await getKmsClientForKeyId(secretRow.kmsKeyId);
  const secrets = new SecretService(kms);
  const apiSecret = await secrets.decryptSecretValue({ secretId: secretRow.id });

  return new WhmcsApiClient({
    baseUrl: conn.baseUrl,
    apiIdentifier: conn.apiIdentifier,
    apiSecret,
  });
}


