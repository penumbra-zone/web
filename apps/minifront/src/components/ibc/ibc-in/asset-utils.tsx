import { assets as cosmosAssetList } from 'chain-registry';
import { Coin } from 'osmo-query';
import { Asset } from '@chain-registry/types';
import { BigNumber } from 'bignumber.js';

// Searches for corresponding denom in asset registry and returns the metadata
export const augmentToAsset = (coin: Coin, chainName: string): Asset => {
  const match = cosmosAssetList
    .find(({ chain_name }) => chain_name === chainName)
    ?.assets.find(asset => asset.base === coin.denom);

  return match ? match : fallbackAsset(coin);
};

const fallbackAsset = (coin: Coin): Asset => {
  return {
    base: coin.denom,
    denom_units: [{ denom: coin.denom, exponent: 0 }],
    display: coin.denom,
    name: coin.denom,
    symbol: coin.denom,
  };
};

// Helps us convert from say 41000000uosmo to the more readable 41osmo
export const rawToDisplayAmount = (asset: Asset, amount: string) => {
  const displayUnit = asset.denom_units.find(({ denom }) => denom === asset.display)?.exponent ?? 0;
  return new BigNumber(amount).shiftedBy(-displayUnit).toString();
};
