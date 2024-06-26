import { SwapSlice } from '.';
import {
  getAddressIndex,
  getMetadataFromBalancesResponseOptional,
} from '@penumbra-zone/getters/balances-response';
import { emptyBalanceResponse } from '../../utils/empty-balance-response';

/**
 * When both `balancesResponses` and `swappableAssets` are loaded, set initial assetIn and assetOut
 */
export const setInitialAssets = (state: SwapSlice) => {
  if (state.swappableAssets.loading || state.balancesResponses.loading) return;

  // Get the `from` and `to` query params and match them to the balances and metadata
  const searchParams = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const account = searchParams.get('account');

  // If `account` is present, filter balances by it
  const balancesByAccount = account
    ? state.balancesResponses.data?.filter(b => getAddressIndex(b).account === Number(account)) ??
      []
    : state.balancesResponses.data ?? [];

  // Find the balance matching the `from` symbol. If balance is not found, take the asset metadata by `from` symbol
  let balanceFrom = from
    ? balancesByAccount.find(
        balance => getMetadataFromBalancesResponseOptional(balance)?.symbol === from,
      )
    : undefined;
  if (!balanceFrom) {
    const matchingMetadata = state.swappableAssets.data?.find(metadata => metadata.symbol === from);
    balanceFrom = matchingMetadata ? emptyBalanceResponse(matchingMetadata) : undefined;
  }

  // Find the metadata matching the `to` symbol
  const metadataTo = to
    ? state.swappableAssets.data?.find(metadata => metadata.symbol === to)
    : undefined;

  const firstMetadata = state.swappableAssets.data?.[0];
  const secondMetadata = state.swappableAssets.data?.[1];
  const firstBalancesResponse = state.balancesResponses.data?.[0];

  // Set the initial `assetIn`
  if (balanceFrom) {
    state.setAssetIn(balanceFrom);
  } else if (firstBalancesResponse) {
    state.setAssetIn(firstBalancesResponse);
  } else if (firstMetadata) {
    state.setAssetIn(emptyBalanceResponse(firstMetadata));
  }

  // Set the initial `assetOut`
  if (metadataTo) {
    state.setAssetOut(metadataTo);
  } else {
    state.setAssetOut(firstBalancesResponse ? firstMetadata : secondMetadata);
  }
};
