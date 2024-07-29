import { AssetId } from '@penumbra-zone/protobuf/types';

export interface BlockProcessorInterface {
  sync(): Promise<void>;
  stop(r?: string): void;
  setNumeraires(numeraires: AssetId[]): void;
}
