import { sct_position } from '../wasm/index.js';
import { Epoch } from '@penumbra-zone/protobuf/types';

/**
 * Returns a serialized representation of a SCT position
 */
export const sctPosition = (blockHeight: bigint, epoch: Epoch): bigint => {
  return sct_position(blockHeight, epoch.toBinary());
};
