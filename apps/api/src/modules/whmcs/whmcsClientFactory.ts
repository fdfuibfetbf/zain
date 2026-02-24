import { WhmcsApiClient } from './whmcsApiClient.js';

export async function createWhmcsApiClient(): Promise<WhmcsApiClient> {
    const baseUrl = process.env.WHMCS_URL;
    const identifier = process.env.WHMCS_API_IDENTIFIER;
    const secret = process.env.WHMCS_API_SECRET;
    const accessKey = process.env.WHMCS_API_ACCESS_KEY;

    if (!baseUrl || !identifier || !secret) {
        throw new Error('WHMCS configuration missing in environment variables');
    }

    return new WhmcsApiClient(baseUrl, identifier, secret, accessKey);
}
