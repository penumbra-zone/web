import { decode_sct_root } from '@penumbra-zone/wasm-bundler';
import { InnerBase64Schema, uint8ArrayToHex, validateSchema } from '@penumbra-zone/types';
import { MerkleRoot } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1alpha1/tct_pb';

export const decodeNctRoot = (hash: Uint8Array): MerkleRoot => {
  const hexString = uint8ArrayToHex(hash);
  const result = validateSchema(InnerBase64Schema, decode_sct_root(hexString));
  return MerkleRoot.fromJson(result);
};
