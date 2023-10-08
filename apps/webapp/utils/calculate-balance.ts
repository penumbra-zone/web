import { Asset } from 'penumbra-constants';
import { LoHi } from 'penumbra-types';

export const calculateBalance = (loHi: LoHi, asset: Asset): number => {
  // found exponent from denomUnits by display name
  const exponent = asset.denomUnits.find(denom => denom.denom === asset.display)?.exponent;

  return (Number(loHi.lo) + 2 ** 64 * Number(loHi.hi)) / (exponent ? 10 ** exponent : 1);
};
