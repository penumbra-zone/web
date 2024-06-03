import { LoaderFunction } from 'react-router-dom';
import { useStore } from '../../state';
import { abortLoader } from '../../abort-loader';
import { SwapRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { fetchUnclaimedSwaps } from '../../fetchers/unclaimed-swaps';
import { viewClient } from '../../clients';
import { getSwapAsset1, getSwapAsset2 } from '@penumbra-zone/getters/swap-record';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import { getSwappableBalancesResponses, isSwappable } from './helpers';
import { getAllAssets } from '../../fetchers/assets';

export interface UnclaimedSwapsWithMetadata {
  swap: SwapRecord;
  asset1: Metadata;
  asset2: Metadata;
}

export type SwapLoaderResponse = UnclaimedSwapsWithMetadata[];

const getAndSetDefaultAssetBalances = async (swappableAssets: Metadata[]) => {
  const balancesResponses = await getSwappableBalancesResponses();

  // set initial denom in if there is an available balance
  if (balancesResponses[0]) {
    useStore.getState().swap.setAssetIn(balancesResponses[0]);
    useStore.getState().swap.setAssetOut(swappableAssets[0]!);
  }

  return balancesResponses;
};

const fetchMetadataForSwap = async (swap: SwapRecord): Promise<UnclaimedSwapsWithMetadata> => {
  const assetId1 = getSwapAsset1(swap);
  const assetId2 = getSwapAsset2(swap);

  const [{ denomMetadata: asset1Metadata }, { denomMetadata: asset2Metadata }] = await Promise.all([
    viewClient.assetMetadataById({ assetId: assetId1 }),
    viewClient.assetMetadataById({ assetId: assetId2 }),
  ]);

  return {
    swap,
    // If no metadata, uses assetId for asset icon display
    asset1: asset1Metadata
      ? asset1Metadata
      : new Metadata({ display: uint8ArrayToBase64(assetId1.inner) }),
    asset2: asset2Metadata
      ? asset2Metadata
      : new Metadata({ display: uint8ArrayToBase64(assetId2.inner) }),
  };
};

export const unclaimedSwapsWithMetadata = async (): Promise<UnclaimedSwapsWithMetadata[]> => {
  const unclaimedSwaps = await fetchUnclaimedSwaps();
  return Promise.all(unclaimedSwaps.map(fetchMetadataForSwap));
};

export const SwapLoader: LoaderFunction = async (): Promise<SwapLoaderResponse> => {
  await abortLoader();
  const assets = await getAllAssets();
  const swappableAssets = assets.filter(isSwappable);

  const [balancesResponses, unclaimedSwaps] = await Promise.all([
    getAndSetDefaultAssetBalances(swappableAssets),
    unclaimedSwapsWithMetadata(),
  ]);
  useStore.getState().swap.setBalancesResponses(balancesResponses);
  useStore.getState().swap.setSwappableAssets(swappableAssets);
  void useStore.getState().swap.dutchAuction.loadAuctionInfos();

  return unclaimedSwaps;
};
