import { UserChoice } from '@penumbra-zone/types/src/user-choice';
import { WalletJson } from '@penumbra-zone/types/src/wallet';
import { KeyPrintJson } from '@penumbra-zone/crypto-web/encryption';

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
  grpcEndpoint?: string;
  passwordKeyPrint?: KeyPrintJson;
  fullSyncHeight?: number;
  knownSites: OriginRecord[];
}
