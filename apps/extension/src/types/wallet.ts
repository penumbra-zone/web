import { Box, BoxJson } from 'penumbra-types';

export interface WalletCreate {
  label: string;
  seedPhrase: string[];
}

// Stored in chrome.local.storage
export interface WalletJson {
  label: string;
  id: string;
  encryptedSeedPhrase: BoxJson;
  fullViewingKey: string;
}

// Stored in zustand memory
export class Wallet {
  constructor(
    readonly label: string,
    readonly id: string,
    readonly fullViewingKey: string,
    readonly encryptedSeedPhrase: Box,
  ) {}

  static fromJson(obj: WalletJson): Wallet {
    return new Wallet(obj.label, obj.id, obj.fullViewingKey, Box.fromJson(obj.encryptedSeedPhrase));
  }

  toJson(): WalletJson {
    return {
      label: this.label,
      id: this.id,
      fullViewingKey: this.fullViewingKey,
      encryptedSeedPhrase: this.encryptedSeedPhrase.toJson(),
    };
  }
}

export const walletsFromJson = (wallets: WalletJson[]): Wallet[] =>
  wallets.map(w => Wallet.fromJson(w));
