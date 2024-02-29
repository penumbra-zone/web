import { LoaderFunction } from 'react-router-dom';
import { getBalances } from '../../fetchers/balances';
import { useStore } from '../../state';
import { throwIfExtNotInstalled } from '../../utils/is-connected';
import {
  BalancesResponse,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { fetchUnclaimedSwaps } from '../../fetchers/unclaimed-swaps';
import { viewClient } from '../../clients/grpc';
import {
  getDisplayDenomFromView,
  getSwapAsset1,
  getSwapAsset2,
  uint8ArrayToBase64
} from '@penumbra-zone/types';
import {assetPatterns, localAssets} from '@penumbra-zone/constants';

export interface UnclaimedSwapsWithMetadata {
  swap: SwapRecord;
  asset1: Metadata;
  asset2: Metadata;
}

export interface SwapLoaderResponse {
  assetBalances: BalancesResponse[];
  unclaimedSwaps: UnclaimedSwapsWithMetadata[];
}

const getAndSetDefaultAssetBalances = async () => {
  const assetBalances = await getBalances();

  // filter assets that are not available for swap
  const filteredAssetBalances = assetBalances.filter(b =>
      [assetPatterns.lpNft, assetPatterns.proposalNft, assetPatterns.unbondingToken, assetPatterns.votingReceipt]
          .every(pattern => !pattern.test(getDisplayDenomFromView(b.balanceView)))
  );
  // set initial denom in if there is an available balance
  if (filteredAssetBalances[0]) {
    useStore.getState().swap.setAssetIn(filteredAssetBalances[0]);
    useStore.getState().swap.setAssetOut(localAssets[0]!);
  }

  return filteredAssetBalances;
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
  throwIfExtNotInstalled();

  const [assetBalances, unclaimedSwaps] = await Promise.all([
    getAndSetDefaultAssetBalances(),
    unclaimedSwapsWithMetadata(),
  ]);

  return { assetBalances, unclaimedSwaps };
};
