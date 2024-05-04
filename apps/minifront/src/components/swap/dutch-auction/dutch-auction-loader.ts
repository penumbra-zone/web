import { throwIfPraxNotConnectedTimeout } from '@penumbra-zone/client/prax';
import { getSwappableBalancesResponses } from '../helpers';
import { useStore } from '../../../state';
import { getAllAssets } from '../../../fetchers/assets';

export const DutchAuctionLoader = async () => {
  await throwIfPraxNotConnectedTimeout();

  // Load into state, but don't block rendering.
  void useStore.getState().dutchAuction.loadAuctions();

  const [assets, balancesResponses] = await Promise.all([
    getAllAssets(),
    getSwappableBalancesResponses(),
  ]);
  useStore.getState().dutchAuction.setBalancesResponses(balancesResponses);

  if (balancesResponses[0]) {
    useStore.getState().dutchAuction.setAssetIn(balancesResponses[0]);
    useStore.getState().dutchAuction.setAssetOut(assets[0]!);
  }

  return assets;
};
