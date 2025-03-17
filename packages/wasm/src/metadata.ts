import { MetadataSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { fromBinary, toBinary } from '@bufbuild/protobuf';
import type { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { customize_symbol } from '../wasm/index.js';

/**
 * Given a `Metadata`, returns a new `Metadata` with the symbol customized if
 * the token is one of several specific types that don't have built-in symbols.
 */
export const customizeSymbol = (metadata: Metadata): Metadata =>
  fromBinary(MetadataSchema, customize_symbol(toBinary(MetadataSchema, metadata)));
