import { bech32m } from 'bech32';
import { PENUMBRA_BECH32_ASSET_PREFIX, PENUMBRA_BECH32_ASSET_LENGTH } from './penumbra-bech32';

// TODO use later - https://github.com/penumbra-zone/web/pull/63#discussion_r1343992139
// https://github.com/penumbra-zone/penumbra/blob/8d1644620779ddfd961e58f0f4703318b3d08910/crates/core/keys/src/address.rs#L201-L211
export const bech32AssetId = (assetId: { inner: Uint8Array }): string => {
  return bech32m.encode(
    PENUMBRA_BECH32_ASSET_PREFIX,
    bech32m.toWords(assetId.inner),
    PENUMBRA_BECH32_ASSET_LENGTH,
  );
};
