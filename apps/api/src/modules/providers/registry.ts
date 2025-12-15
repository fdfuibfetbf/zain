import type { ProviderType } from '@prisma/client';

import { DigitalOceanAdapter } from './adapters/digitalocean.js';
import { HetznerAdapter } from './adapters/hetzner.js';
import type { ProviderAdapter } from './types.js';

export function createProviderAdapter(args: {
  type: ProviderType;
  credentialPlaintext: string;
}): ProviderAdapter {
  switch (args.type) {
    case 'hetzner':
      return new HetznerAdapter(args.credentialPlaintext);
    case 'digitalocean':
      return new DigitalOceanAdapter(args.credentialPlaintext);
    case 'contabo':
    case 'datawagon':
    case 'vultr':
    case 'linode':
      throw new Error(`Provider adapter not implemented yet: ${args.type}`);
  }
}


