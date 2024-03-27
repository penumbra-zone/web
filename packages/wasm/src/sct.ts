import { valid_sct_root } from '../wasm';
import { MerkleRoot } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';
import { PlainMessage } from '@bufbuild/protobuf';

export const validSctRoot = (root: PlainMessage<MerkleRoot>): boolean => valid_sct_root(root.inner);
