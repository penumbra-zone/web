import { toBinary } from '@bufbuild/protobuf';
import { Epoch, EpochSchema } from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import { sct_position } from '../wasm/index.js';

/**
 * Returns a serialized representation of a SCT position
 */
export const sctPosition = (blockHeight: bigint, epoch: Epoch): bigint => {
  return sct_position(blockHeight, toBinary(EpochSchema, epoch));
};
