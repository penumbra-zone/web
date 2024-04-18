import { LoaderFunction } from 'react-router-dom';
import { getBalances } from '../../fetchers/balances';
import { useStore } from '../../state';
import { throwIfPraxNotConnectedTimeout } from '@penumbra-zone/client';
import {
  BalancesResponse,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { fetchUnclaimedSwaps } from '../../fetchers/unclaimed-swaps';
import { viewClient } from '../../clients';
import { assetPatterns } from '@penumbra-zone/constants/src/assets';
import {
  getAmount,
  getDisplayDenomExponentFromValueView,
  getDisplayDenomFromView,
} from '@penumbra-zone/getters/src/value-view';
import { getSwapAsset1, getSwapAsset2 } from '@penumbra-zone/getters/src/swap-record';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/src/base64';
import { fromBaseUnitAmount } from '@penumbra-zone/types/src/amount';
import { getAssetsFromRegistry } from '../../fetchers/registry';

export interface UnclaimedSwapsWithMetadata {
  swap: SwapRecord;
  asset1: Metadata;
  asset2: Metadata;
}

export interface SwapLoaderResponse {
  assetBalances: BalancesResponse[];
  unclaimedSwaps: UnclaimedSwapsWithMetadata[];
  registryAssets: Metadata[];
}

const byBalanceDescending = (a: BalancesResponse, b: BalancesResponse) => {
  const aExponent = getDisplayDenomExponentFromValueView(a.balanceView);
  const bExponent = getDisplayDenomExponentFromValueView(b.balanceView);
  const aAmount = fromBaseUnitAmount(getAmount(a.balanceView), aExponent);
  const bAmount = fromBaseUnitAmount(getAmount(b.balanceView), bExponent);

  return bAmount.comparedTo(aAmount);
};

const getAndSetDefaultAssetBalances = async (registryAssets: Metadata[]) => {
  const assetBalances = await getBalances();

  // filter assets that are not available for swap
  const filteredAssetBalances = assetBalances
    .filter(b =>
      [assetPatterns.lpNft, assetPatterns.proposalNft, assetPatterns.votingReceipt].every(
        pattern => !pattern.matches(getDisplayDenomFromView(b.balanceView)),
      ),
    )
    .sort(byBalanceDescending);

  // set initial denom in if there is an available balance
  if (filteredAssetBalances[0]) {
    useStore.getState().swap.setAssetIn(filteredAssetBalances[0]);
    useStore.getState().swap.setAssetOut(registryAssets[0]!);
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
  await throwIfPraxNotConnectedTimeout();

  let registryAssets = await getAssetsFromRegistry();

  const [assetBalances, unclaimedSwaps] = await Promise.all([
    getAndSetDefaultAssetBalances(registryAssets),
    unclaimedSwapsWithMetadata(),
  ]);

  return { assetBalances, unclaimedSwaps, registryAssets };
};
