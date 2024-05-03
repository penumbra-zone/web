import { assets as cosmosAssetList } from 'chain-registry';
import { Coin } from 'osmo-query';
import { Asset } from '@chain-registry/types';
import { BigNumber } from 'bignumber.js';
import { AssetDenomUnit } from '@chain-registry/types/assets';

// Searches for corresponding denom in asset registry and returns the metadata
export const augmentToAsset = (denom: string, chainName: string): Asset => {
  const match = cosmosAssetList
    .find(({ chain_name }) => chain_name === chainName)
    ?.assets.find(asset => asset.base === denom);

  return match ? match : fallbackAsset(denom);
};

const fallbackAsset = (denom: string): Asset => {
  return {
    base: denom,
    denom_units: [{ denom, exponent: 0 }],
    display: denom,
    name: denom,
    symbol: denom,
  };
};

// Helps us convert from say 41000000uosmo to the more readable 41osmo
export const toDisplayAmount = (asset: Asset, coin: Coin): string => {
  const currentExponent = getExponent(asset.denom_units, coin.denom);
  const displayExponent = getExponent(asset.denom_units, asset.display);
  if (currentExponent === undefined || displayExponent === undefined) {
    return coin.amount;
  }

  const exponentDifference = currentExponent - displayExponent;
  return new BigNumber(coin.amount).shiftedBy(exponentDifference).toString();
};

// Converts a readable amount back to its base amount
export const fromDisplayAmount = (
  asset: Asset,
  displayDenom: string,
  displayAmount: string,
): Coin => {
  const displayExponent = getExponent(asset.denom_units, displayDenom);
  if (displayExponent === undefined) {
    return { denom: displayDenom, amount: displayAmount };
  }

  // Defaults to zero if not found
  const baseExponent = getExponent(asset.denom_units, asset.base) ?? 0;

  const exponentDifference = displayExponent - baseExponent;
  const amount = new BigNumber(displayAmount).shiftedBy(exponentDifference).toString();
  return { denom: asset.base, amount };
};

const getExponent = (denomUnits: AssetDenomUnit[], denom: string): number | undefined => {
  return denomUnits.find(unit => unit.denom === denom)?.exponent;
};
