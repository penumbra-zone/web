import { uint8ArrayToHex } from './utils';
import { base64_to_bech32, decode_nct_root } from '@penumbra-zone/wasm-bundler';
import {
  Base64StringSchema,
  InnerBase64Schema,
  uint8ArrayToBase64,
  validateSchema,
} from 'penumbra-types';
import { z } from 'zod';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

export const decodeNctRoot = (hash: Uint8Array): string => {
  const hexString = uint8ArrayToHex(hash);
  const result = validateSchema(InnerBase64Schema, decode_nct_root(hexString));
  return result.inner;
};

export const generateMetadata = (assetId: Uint8Array): DenomMetadata => {
  const denom = base64ToBech32(uint8ArrayToBase64(assetId));
  return new DenomMetadata({
    base: denom,
    denomUnits: [{ aliases: [], denom, exponent: 0 }],
    display: denom,
    penumbraAssetId: { inner: assetId },
  });
};

export const UNNAMED_ASSET_PREFIX = 'unnamed_asset';

export const base64ToBech32 = (base64Str: string): string => {
  const validated = validateSchema(Base64StringSchema, base64Str);
  return validateSchema(z.string(), base64_to_bech32(UNNAMED_ASSET_PREFIX, validated));
};
