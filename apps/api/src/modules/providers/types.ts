import type { ProviderType } from '@prisma/client';

export type ProviderActionResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; retryable?: boolean };

export type CreateServerRequest = {
  name: string;
  planRef: Record<string, unknown>;
  userData?: string;
};

export type CreateServerResponse = {
  providerResourceId: string;
  ip?: string;
  credentials?: Record<string, string>;
  raw?: unknown;
};

export type ProviderAdapter = {
  type: ProviderType;

  createServer(req: CreateServerRequest): Promise<ProviderActionResult<CreateServerResponse>>;
  suspendServer(providerResourceId: string): Promise<ProviderActionResult<void>>;
  rebootServer(providerResourceId: string): Promise<ProviderActionResult<void>>;
  terminateServer(providerResourceId: string): Promise<ProviderActionResult<void>>;
  reinstallServer(providerResourceId: string, planRef?: Record<string, unknown>): Promise<ProviderActionResult<void>>;
  powerOn(providerResourceId: string): Promise<ProviderActionResult<void>>;
  powerOff(providerResourceId: string): Promise<ProviderActionResult<void>>;
};

export type ProviderAdapterFactory = (args: {
  credentialPlaintext: string;
}) => ProviderAdapter;


