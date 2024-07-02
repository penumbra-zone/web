import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { AllSlices, Middleware } from '..';
import { getSwapQueryParams } from './query-params';
import {
  getAddressIndex,
  getMetadataFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { swappableAssetsSelector, swappableBalancesResponsesSelector } from './helpers';
import { emptyBalanceResponse } from '../../utils/empty-balance-response';

const byAccount = (account: number) => (balancesResponse: BalancesResponse) =>
  getAddressIndex(balancesResponse).account === account;

/**
 * 1. If there's a `from` query string parameter, and the user has a balance of
 * that asset, return that `BalancesResponse`.
 * 2. If there's a `from` query string parameter, and the user does not have a
 * balance of that asset but we do have metadata for that asset, create and
 * return a zero-balance `BalancesResponse` referring to that asset.
 * 3. If there's already a `swap.assetIn` set, return that. (Note that this is
 * the third step, because a `from` query string parameter should override
 * this.)
 * 4. Otherwise, simply return a zero-balance `BalancesResponse` referring to
 * the first available swappable asset.
 */
const getAssetIn = (state: AllSlices, from?: string, account?: number) => {
  const swappableBalancesResponses =
    swappableBalancesResponsesSelector(state.shared.balancesResponses).data ?? [];
  const filteredSwappableBalancesResponses = account
    ? swappableBalancesResponses.filter(byAccount(account))
    : swappableBalancesResponses;

  if (from) {
    const matchingBalancesResponse = filteredSwappableBalancesResponses.find(
      balance => getMetadataFromBalancesResponse.optional()(balance)?.symbol === from,
    );
    if (matchingBalancesResponse) return matchingBalancesResponse;

    const matchingMetadata = state.shared.assets.data?.find(metadata => metadata.symbol === from);
    if (matchingMetadata) return emptyBalanceResponse(matchingMetadata, account);
  }

  if (state.swap.assetIn) return state.swap.assetIn;

  const firstSwappableAsset = (swappableAssetsSelector(state.shared.assets).data ?? [])[0];
  return firstSwappableAsset ? emptyBalanceResponse(firstSwappableAsset, account) : undefined;
};

/**
 * 1. If there's a `to` query string parameter, and we have a `Metadata` with
 * that symbol, return that `Metadata`.
 * 2. If there's already a `swap.assetOut` set, return that. (Note that this is
 * the third step, because a `to` query string parameter should override this.)
 * 3. Otherwise, simply return the first swappable asset, if it exists.
 */
const getAssetOut = (state: AllSlices, to?: string) => {
  const swappableAssets = swappableAssetsSelector(state.shared.assets).data ?? [];

  if (to) {
    const matchingAsset = swappableAssets.find(asset => asset.symbol === to);
    if (matchingAsset) return matchingAsset;
  }

  if (state.swap.assetOut) return state.swap.assetOut;

  return swappableAssets[0];
};

/**
 * This middleware sets `swap.assetIn` and `swap.assetOut` based on the relevant
 * query params as well as the balances responses and assets in the `shared`
 * slice.
 */
export const swapBalancesMiddleware: Middleware = f => (set, get, store) => {
  const modifiedSetter: typeof set = (...args) => {
    const before = get();
    set(...args);
    const after = get();

    const balancesResponsesWereJustSet =
      before.shared.balancesResponses.data !== after.shared.balancesResponses.data &&
      !!after.shared.balancesResponses.data?.[0];
    const assetsWereJustSet =
      before.shared.assets.data !== after.shared.assets.data && !!after.shared.assets.data?.[0];

    if (!balancesResponsesWereJustSet && !assetsWereJustSet) return;

    const { from, to, account } = getSwapQueryParams();

    const assetIn = getAssetIn(after, from, account);
    const assetOut = getAssetOut(after, to);

    set(state => ({
      ...state,
      swap: {
        ...state.swap,
        assetIn,
        assetOut,
      },
    }));
  };

  store.setState = modifiedSetter;

  return f(modifiedSetter, get, store);
};
