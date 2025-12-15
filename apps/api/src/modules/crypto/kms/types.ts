export type KmsEncryptResult = {
  encryptedKey: Buffer;
  keyId?: string;
};

export type KmsDecryptResult = {
  plaintextKey: Buffer;
  keyId?: string;
};

export interface KmsClient {
  encrypt(args: { keyId: string; plaintext: Buffer; aad?: Buffer }): Promise<KmsEncryptResult>;
  decrypt(args: { ciphertext: Buffer; aad?: Buffer }): Promise<KmsDecryptResult>;
}


