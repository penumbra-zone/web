import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1/app_pb';
import { KeyPrintJson } from '@penumbra-zone/crypto-web/encryption';
import { Jsonified } from '@penumbra-zone/types/jsonified';
import { UserChoice } from '@penumbra-zone/types/user-choice';
import { WalletJson } from '@penumbra-zone/types/wallet';

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
  grpcEndpoint: string | undefined;
  frontendUrl: string;
  passwordKeyPrint: KeyPrintJson | undefined;
  fullSyncHeight: number | undefined;
  knownSites: OriginRecord[];
  params: Jsonified<AppParameters> | undefined;
}
