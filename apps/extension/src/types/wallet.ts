export interface Wallet {
  label: string;
  encryptedSeedPhrase: ArrayBuffer;
  initializationVector: Uint8Array;
  fullViewingKey: string;
}
