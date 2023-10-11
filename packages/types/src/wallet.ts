import { Box, BoxJson } from './box';

export interface WalletCreate {
  label: string;
  seedPhrase: string[];
}

// Stored in chrome.local.storage
export interface WalletJson {
  label: string;
  id: string;
  fullViewingKey: string;
  custody: { encryptedSeedPhrase: BoxJson };
}

export interface HotWallet {
  encryptedSeedPhrase: Box;
}

export type Custody = HotWallet; // Later on, could have different types (like ledger)

// Stored in zustand memory
export class Wallet {
  constructor(
    readonly label: string,
    readonly id: string,
    readonly fullViewingKey: string,
    readonly custody: Custody,
  ) {}

  static fromJson(obj: WalletJson): Wallet {
    return new Wallet(obj.label, obj.id, obj.fullViewingKey, {
      encryptedSeedPhrase: Box.fromJson(obj.custody.encryptedSeedPhrase),
    });
  }

  toJson(): WalletJson {
    return {
      label: this.label,
      id: this.id,
      fullViewingKey: this.fullViewingKey,
      custody: {
        encryptedSeedPhrase: this.custody.encryptedSeedPhrase.toJson(),
      },
    };
  }
}

export const walletsFromJson = (wallets: WalletJson[]): Wallet[] =>
  wallets.map(w => Wallet.fromJson(w));
