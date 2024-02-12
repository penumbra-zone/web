import { decode_sct_root } from '../wasm';
import { uint8ArrayToHex } from '@penumbra-zone/types';
import { MerkleRoot } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';
import { JsonValue } from '@bufbuild/protobuf';

export const decodeSctRoot = (hash: Uint8Array): MerkleRoot => {
  const hexString = uint8ArrayToHex(hash);
  const result = decode_sct_root(hexString) as JsonValue;
  return MerkleRoot.fromJson(result);
};
