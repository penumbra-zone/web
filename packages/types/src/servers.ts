import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/chain/v1alpha1/chain_pb';
import { ScanResult } from './tct';

export interface ViewServerInterface {
  scanBlock(compactBlock: CompactBlock): Promise<ScanResult>;
}
