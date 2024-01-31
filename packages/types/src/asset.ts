import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { bech32m } from 'bech32';

// Globally set Bech32 prefix used for asset IDs
const BECH32_PREFIX = 'passet';

// TODO use later - https://github.com/penumbra-zone/web/pull/63#discussion_r1343992139
// https://github.com/penumbra-zone/penumbra/blob/8d1644620779ddfd961e58f0f4703318b3d08910/crates/core/keys/src/address.rs#L201-L211
export const bech32AssetId = (assetId: AssetId): string => {
  return bech32m.encode(BECH32_PREFIX, bech32m.toWords(assetId.inner), 160);
};
