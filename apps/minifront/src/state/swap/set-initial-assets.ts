import {
  getAddressIndex,
  getMetadataFromBalancesResponseOptional,
} from '@penumbra-zone/getters/balances-response';
import { emptyBalanceResponse } from '../../utils/empty-balance-response';
import { getSwapQueryParams } from './query-params';
import { useStore } from '..';

/**
 * When both `balancesResponses` and `swappableAssets` are loaded, set initial assetIn and assetOut
 */
export const setInitialAssets = () => {
  useStore.setState(state => {
    const swap = useStore.getState().swap;

    if (swap.swappableAssets.loading || swap.balancesResponses.loading) return;

    const { from, to, account } = getSwapQueryParams();

    // If `account` is present, filter balances by it
    const balancesByAccount = account
      ? swap.balancesResponses.data?.filter(b => getAddressIndex(b).account === account) ?? []
      : swap.balancesResponses.data ?? [];

    // Find the balance matching the `from` symbol. If balance is not found, take the asset metadata by `from` symbol
    let balanceFrom = from
      ? balancesByAccount.find(
          balance => getMetadataFromBalancesResponseOptional(balance)?.symbol === from,
        )
      : undefined;
    if (!balanceFrom) {
      const matchingMetadata = swap.swappableAssets.data?.find(
        metadata => metadata.symbol === from,
      );
      balanceFrom = matchingMetadata ? emptyBalanceResponse(matchingMetadata, account) : undefined;
    }

    // Find the metadata matching the `to` symbol
    const metadataTo = to
      ? swap.swappableAssets.data?.find(metadata => metadata.symbol === to)
      : undefined;

    const firstMetadata = swap.swappableAssets.data?.[0];
    const secondMetadata = swap.swappableAssets.data?.[1];
    const firstBalancesResponse = swap.balancesResponses.data?.[0];

    // Set the initial `assetIn`
    if (balanceFrom) {
      state.swap.assetIn = balanceFrom;
    } else if (firstBalancesResponse) {
      state.swap.assetIn = firstBalancesResponse;
    } else if (firstMetadata) {
      state.swap.assetIn = emptyBalanceResponse(firstMetadata, account);
    }

    // Set the initial `assetOut`
    if (metadataTo) {
      state.swap.assetOut = metadataTo;
    } else {
      state.swap.assetOut = firstBalancesResponse ? firstMetadata : secondMetadata;
    }
  });
};
