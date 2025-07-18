import { assets as cosmosAssetList } from 'chain-registry';
import { Asset, DenomUnit } from '@chain-registry/types';
import BigNumber from 'bignumber.js';
import { CosmosAssetBalance } from './hooks.ts';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { bigNumConfig } from '@penumbra-zone/types/lo-hi';
import { Coin } from '@cosmjs/stargate';

// Searches for corresponding denom in asset registry and returns the metadata
export const augmentToAsset = (denom: string, chainName: string): Asset => {
  const match = cosmosAssetList
    .find(({ chain_name }) => chain_name === chainName)
    ?.assets.find(asset => asset.base === denom);

  return match ?? fallbackAsset(denom);
};

const fallbackAsset = (denom: string): Asset => {
  return {
    base: denom,
    denom_units: [{ denom, exponent: 0 }],
    display: denom,
    name: denom,
    symbol: denom,
    type_asset: 'sdk.coin',
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

  // Overriding repo default and setting a very high threshold to avoid exponential notation
  const CustomBigNumber = BigNumber.clone({ ...bigNumConfig, EXPONENTIAL_AT: [-1e9, 1e9] });

  const amount = new CustomBigNumber(displayAmount).shiftedBy(exponentDifference).toString();
  return { denom: asset.base, amount };
};

const getExponent = (denomUnits: DenomUnit[], denom: string): number | undefined => {
  return denomUnits.find(unit => unit.denom === denom)?.exponent;
};

export const getIconWithUmFallback = (b: CosmosAssetBalance) => {
  if (b.icon) {
    return b.icon;
  }
  // If we've identified UM, but it's got to this line,
  // that means there is not an entry for UM in the counterparty chain's asset registry.
  // To help users identify the ibc asset, this manually grabs the UM asset icon.
  if (b.isPenumbra) {
    const client = new ChainRegistryClient().bundled;
    const umAssetId = client.globals().stakingAssetId;
    const umMetadata = client.get('penumbra-1').getMetadata(umAssetId);
    return umMetadata.images[0]?.svg;
  }
  return undefined;
};
