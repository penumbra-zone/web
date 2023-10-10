import { Asset } from 'penumbra-constants';
import { LoHi, joinLoHi } from 'penumbra-types';

export const calculateBalance = (loHi: LoHi, asset: Asset): number => {
  // found exponent from denomUnits by display name
  const exponent = asset.denomUnits.find(denom => denom.denom === asset.display)?.exponent;

  return Number(joinLoHi(loHi.lo, loHi.hi)) / (exponent ? 10 ** exponent : 1);
};
