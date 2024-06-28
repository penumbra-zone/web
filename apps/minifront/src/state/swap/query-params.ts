import type { AllSlices } from '..';
import {
  getAddressIndex,
  getMetadataFromBalancesResponseOptional,
} from '@penumbra-zone/getters/balances-response';

interface SwapQueryParams {
  from?: string;
  to?: string;
  account?: number;
}

/**
 * Extracts and parses the swap query parameters from the URL hash: from, to, account
 */
export const getSwapQueryParams = (): SwapQueryParams => {
  const searchParams = new URLSearchParams(window.location.hash.split('?')[1] ?? '');

  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;
  const account = Number(searchParams.get('account')) || undefined;

  return {
    from,
    to,
    account,
  };
};

/**
 * Sets the swap query parameters in the URL hash based on the store state
 */
export const setSwapQueryParams = (state: AllSlices): void => {
  const fromSymbol = getMetadataFromBalancesResponseOptional(state.swap.assetIn)?.symbol;
  const toSymbol = state.swap.assetOut?.symbol;
  const accountIndex = getAddressIndex.optional()(state.swap.assetIn)?.account;

  const searchParams = new URLSearchParams();
  if (fromSymbol) {
    searchParams.append('from', fromSymbol);
  }

  if (toSymbol) {
    searchParams.append('to', toSymbol);
  }

  if (accountIndex) {
    searchParams.append('account', accountIndex.toString());
  }

  const pagePath = window.location.hash.split('?')[0];
  window.location.hash = `${pagePath}?${searchParams.toString()}`;
};
