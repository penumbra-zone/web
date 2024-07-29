import { Metadata } from '@penumbra-zone/protobuf/types';
import { customize_symbol } from '../wasm/index.js';

/**
 * Given a `Metadata`, returns a new `Metadata` with the symbol customized if
 * the token is one of several specific types that don't have built-in symbols.
 */
export const customizeSymbol = (metadata: Metadata): Metadata =>
  Metadata.fromBinary(customize_symbol(metadata.toBinary()));
