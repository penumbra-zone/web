import { viewClient } from '../clients';
import Array from '@penumbra-zone/polyfills/Array.fromAsync';
import { SwapRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getUnclaimedSwaps } from '@penumbra-zone/getters/unclaimed-swaps-response';
import { UnclaimedSwapsWithMetadata } from '../state/unclaimed-swaps';
import { getSwapAsset1, getSwapAsset2 } from '@penumbra-zone/getters/swap-record';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';

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

const byHeightDescending = (a: UnclaimedSwapsWithMetadata, b: UnclaimedSwapsWithMetadata): number =>
  Number(b.swap.outputData?.height) - Number(a.swap.outputData?.height);

export const fetchUnclaimedSwaps = async (
  signal?: AbortSignal,
): Promise<UnclaimedSwapsWithMetadata[]> => {
  const responses = await Array.fromAsync(viewClient.unclaimedSwaps({}, { signal }));
  const unclaimedSwaps = responses.map(getUnclaimedSwaps);
  const unclaimedSwapsWithMetadata = await Promise.all(unclaimedSwaps.map(fetchMetadataForSwap));

  return unclaimedSwapsWithMetadata.sort(byHeightDescending);
};
