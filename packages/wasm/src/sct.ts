import { uint8ArrayToHex } from './utils';
import { decode_nct_root } from '@penumbra-zone/wasm-bundler';
import { InnerBase64Schema, validateSchema } from 'penumbra-types';

export const decodeNctRoot = (hash: Uint8Array): string => {
  const hexString = uint8ArrayToHex(hash);
  const result = validateSchema(InnerBase64Schema, decode_nct_root(hexString));
  return result.inner;
};
