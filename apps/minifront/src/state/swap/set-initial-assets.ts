import {
  getAddressIndex,
  getMetadataFromBalancesResponseOptional,
} from '@penumbra-zone/getters/balances-response';
import { emptyBalanceResponse } from '../../utils/empty-balance-response';
import { getSwapQueryParams } from './query-params';
import type { useStore } from '..';
import { swappableAssetsSelector } from './helpers';

/**
 * When both `balancesResponses` and `swappableAssets` are loaded, set initial assetIn and assetOut
 */
export const setInitialAssets = (store: typeof useStore) => {
  const state = store.getState();
  if (state.shared.assets.loading || state.shared.balancesResponses.loading) return;

  const { from, to, account } = getSwapQueryParams();

  // If `account` is present, filter balances by it
  const balancesByAccount = account
    ? (state.shared.balancesResponses.data ?? []).filter(
        b => getAddressIndex(b).account === account,
      )
    : state.shared.balancesResponses.data ?? [];

  // Find the balance matching the `from` symbol. If balance is not found, take the asset metadata by `from` symbol
  let balanceFrom = from
    ? balancesByAccount.find(
        balance => getMetadataFromBalancesResponseOptional(balance)?.symbol === from,
      )
    : undefined;
  if (!balanceFrom) {
    const matchingMetadata = state.shared.assets.data?.find(metadata => metadata.symbol === from);
    balanceFrom = matchingMetadata ? emptyBalanceResponse(matchingMetadata, account) : undefined;
  }

  // Find the metadata matching the `to` symbol
  const metadataTo = to
    ? state.shared.assets.data?.find(metadata => metadata.symbol === to)
    : undefined;

  const firstMetadata = swappableAssetsSelector(state.shared.assets).data?.[0];
  const secondMetadata = swappableAssetsSelector(state.shared.assets).data?.[1];
  const firstBalancesResponse = state.shared.balancesResponses.data?.[0];

  store.setState(state => {
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

    return state;
  });
};
