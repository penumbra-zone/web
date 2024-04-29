import { sct_position } from '../wasm';
import { Epoch } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';

/**
 * Returns a serialized representation of a SCT position
 */
export const sctPosition = (blockHeight: bigint, epoch: Epoch): bigint => {
  return sct_position(blockHeight, epoch.toBinary());
};
