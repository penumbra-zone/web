import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export interface BlockProcessorInterface {
  sync(isFreshWallet?: boolean, walletCreationBlockHeight?: number): Promise<void>;
  stop(r?: string): void;
  setNumeraires(numeraires: AssetId[]): void;
}
