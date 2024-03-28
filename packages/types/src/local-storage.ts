import { UserChoice } from './user-choice';
import type { WalletJson } from './wallet';
import { Base64Str } from './base64';

export enum LocalStorageVersion {
  V1 = 'V1',
  V2 = 'V2',
}

export interface OriginRecord {
  origin: string;
  choice: UserChoice;
  date: number;
}

export interface LocalStorageState {
  wallets: WalletJson[];
  grpcEndpoint: string;
  passwordKeyPrint?: KeyPrintJson;
  fullSyncHeight: number;
  knownSites: OriginRecord[];
}

export interface KeyPrintJson {
  hash: Base64Str;
  salt: Base64Str;
}
