import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { customize_symbol } from '../wasm';

/**
 * Given a `Metadata`, returns a new `Metadata` with the symbol customized if
 * the token is one of several specific types that don't have built-in symbols.
 */
export const customizeSymbol = (metadata: Metadata): Metadata =>
  Metadata.fromBinary(customize_symbol(metadata.toBinary()));
