import { AssetsResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { calculateLoHiExponent, splitLoHi } from './lo-hi';

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

// Given an asset has many denom units, the amount should be formatted using
// the exponent of the display denom (e.g. 1,954,000,000 amount of penumbra^6 is 1,954)
export const displayAmount = (asset: AssetsResponse, amount: number): number => {
  const exponent = asset.denomMetadata?.denomUnits.find(
    d => d.denom === asset.denomMetadata?.display,
  );
  if (!exponent) return amount;

  const { lo, hi } = splitLoHi(BigInt(amount));
  return Number(calculateLoHiExponent(lo, hi, exponent.exponent));
};
