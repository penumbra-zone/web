import { decode_sct_root } from '../wasm';
import { MerkleRoot } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import { PlainMessage } from '@bufbuild/protobuf';

export const decodeSctRoot = (txId: PlainMessage<TransactionId>): MerkleRoot =>
  new MerkleRoot({ inner: decode_sct_root(txId.inner) });
