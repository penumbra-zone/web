import { Base64Str } from 'penumbra-types';

export interface Wallet {
  label: string;
  encryptedSeedPhrase: Base64Str;
  initializationVector: Base64Str;
  fullViewingKey: string;
}
