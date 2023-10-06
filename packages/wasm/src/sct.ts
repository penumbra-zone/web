import { decode_nct_root } from '@penumbra-zone/wasm-bundler';
import { InnerBase64Schema, uint8ArrayToHex, validateSchema } from 'penumbra-types';

export const decodeNctRoot = (hash: Uint8Array): string => {
  const hexString = uint8ArrayToHex(hash);
  const result = validateSchema(InnerBase64Schema, decode_nct_root(hexString));
  return result.inner;
};
