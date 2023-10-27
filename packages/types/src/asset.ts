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
