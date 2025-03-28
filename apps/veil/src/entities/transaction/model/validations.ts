import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { fromValueView } from '@penumbra-zone/types/amount';
import { BigNumber } from 'bignumber.js';
import {
  getMetadataFromBalancesResponse,
  getValueViewCaseFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';

// We don't have ConnectError in this scope, so we only detect standard Error.
// Any ConnectError code is named at the beginning of the message value.

export const userDeniedTransaction = (e: unknown): boolean =>
  e instanceof Error && e.message.startsWith('[permission_denied]');

export const unauthenticated = (e: unknown): boolean =>
  e instanceof Error && e.message.startsWith('[unauthenticated]');

export const amountMoreThanBalance = (
  asset: BalancesResponse,
  /**
   * The amount that a user types into the interface will always be in the
   * display denomination -- e.g., in `penumbra`, not in `upenumbra`.
   */
  amountInDisplayDenom: string,
): boolean => {
  if (!asset.balanceView) {
    throw new Error('Missing balanceView');
  }

  const balanceAmt = fromValueView(asset.balanceView);
  return Boolean(amountInDisplayDenom) && BigNumber(amountInDisplayDenom).gt(balanceAmt);
};

/**
 * Checks if the entered amount fraction part is longer than the asset's exponent
 */
export const isIncorrectDecimal = (
  asset: BalancesResponse,
  /**
   * The amount that a user types into the interface will always be in the
   * display denomination -- e.g., in `penumbra`, not in `upenumbra`.
   */
  amountInDisplayDenom: string,
): boolean => {
  if (!asset.balanceView) {
    throw new Error('Missing balanceView');
  }

  const exponent = getDisplayDenomExponent.optional(
    getMetadataFromBalancesResponse.optional(asset),
  );
  const fraction = amountInDisplayDenom.split('.')[1]?.length;
  return typeof exponent !== 'undefined' && typeof fraction !== 'undefined' && fraction > exponent;
};

export const isValidAmount = (amount: string, assetIn?: BalancesResponse) =>
  Number(amount) >= 0 &&
  (!assetIn || !amountMoreThanBalance(assetIn, amount)) &&
  (!assetIn || !isIncorrectDecimal(assetIn, amount));

export const isKnown = (balancesResponse: BalancesResponse) =>
  getValueViewCaseFromBalancesResponse.optional(balancesResponse) === 'knownAssetId';
