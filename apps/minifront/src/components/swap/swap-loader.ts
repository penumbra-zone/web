import { LoaderFunction } from 'react-router-dom';
import { useStore } from '../../state';
import { abortLoader } from '../../abort-loader';
import { SwapRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getSwappableBalancesResponses, isSwappable } from './helpers';
import { getAllAssets } from '../../fetchers/assets';
import { getStakingTokenMetadata } from '../../fetchers/registry';

export interface UnclaimedSwapsWithMetadata {
  swap: SwapRecord;
  asset1: Metadata;
  asset2: Metadata;
}

export type SwapLoaderResponse = UnclaimedSwapsWithMetadata[];

const getAndSetDefaultAssetBalances = async (swappableAssets: Metadata[]) => {
  const balancesResponses = await getSwappableBalancesResponses();
  const stakingTokenAssetMetadata = await getStakingTokenMetadata();

  // set initial denom in if there is an available balance
  if (balancesResponses[0]) {
    useStore.getState().swap.setAssetIn(balancesResponses[0]);
    useStore.getState().swap.setAssetOut(swappableAssets[0]!);
    useStore.getState().swap.setStakingAssetMetadata(stakingTokenAssetMetadata);
  }

  return balancesResponses;
};

export const SwapLoader: LoaderFunction = async (): Promise<null> => {
  await abortLoader();
  const assets = await getAllAssets();
  const swappableAssets = assets.filter(isSwappable);

  const balancesResponses = await getAndSetDefaultAssetBalances(swappableAssets);
  useStore.getState().swap.setBalancesResponses(balancesResponses);
  useStore.getState().swap.setSwappableAssets(swappableAssets);

  return null;
};
