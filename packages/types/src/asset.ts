import { AssetId as ProtoAssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { bech32m } from 'bech32';

// TODO: These types should not exist. Replace with protos later.
export interface AssetDenom {
  denom: string;
  exponent: number;
  aliases: never[];
}

export interface AssetId {
  inner: string;
  altBech32: string;
  altBaseDenom: string;
}

export interface Asset {
  base: string;
  description: string;
  display: string;
  name: string;
  symbol: string;
  uri: string;
  uriHash: string;
  denomUnits: AssetDenom[];
  penumbraAssetId: AssetId;
  icon?: string;
}

// Globally set Bech32 prefix used for asset IDs
const BECH32_PREFIX = 'passet';

// TODO use later - https://github.com/penumbra-zone/web/pull/63#discussion_r1343992139
// https://github.com/penumbra-zone/penumbra/blob/8d1644620779ddfd961e58f0f4703318b3d08910/crates/core/keys/src/address.rs#L201-L211
export const bech32AssetId = (assetId: ProtoAssetId): string => {
  return bech32m.encode(BECH32_PREFIX, bech32m.toWords(assetId.inner), 160);
};
