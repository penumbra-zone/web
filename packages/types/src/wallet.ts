import { Box, BoxJson } from './box';
import {
  FullViewingKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import {Stringified} from "./jsonified";

export interface WalletCreate {
  label: string;
  seedPhrase: string[];
}

// Stored in chrome.local.storage
export interface WalletJson {
  label: string;
  id: Stringified<WalletId>;
  fullViewingKey: Stringified<FullViewingKey>;
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
    readonly id: WalletId,
    readonly fullViewingKey: FullViewingKey,
    readonly custody: Custody,
  ) {}

  static fromJson(obj: WalletJson): Wallet {
    return new Wallet(
      obj.label,
      FullViewingKey.fromJsonString(obj.id),
      FullViewingKey.fromJsonString(obj.fullViewingKey),
      {
        encryptedSeedPhrase: Box.fromJson(obj.custody.encryptedSeedPhrase),
      },
    );
  }

  toJson(): WalletJson {
    return {
      label: this.label,
      id: this.id.toJsonString(),
      fullViewingKey: this.fullViewingKey.toJsonString(),
      custody: {
        encryptedSeedPhrase: this.custody.encryptedSeedPhrase.toJson(),
      },
    };
  }
}

export const walletsFromJson = (wallets: WalletJson[]): Wallet[] =>
  wallets.map(w => Wallet.fromJson(w));
