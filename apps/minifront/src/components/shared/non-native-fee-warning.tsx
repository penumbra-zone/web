import { ReactNode } from 'react';

import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  getAddressIndex,
  getAmount,
  getAssetIdFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { GasPrices } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import { useGasPrices, useStakingTokenMetadata } from '../../state/shared.ts';
import { hasStakingToken } from '../../fetchers/gas-prices.ts';

const hasRelevantAltTokenBalance = ({
  source,
  balancesResponses = [],
  gasPrices,
  stakingAssetMetadata,
}: {
  source?: BalancesResponse;
  balancesResponses: BalancesResponse[];
  gasPrices: GasPrices[];
  stakingAssetMetadata?: Metadata;
}): boolean => {
  const account = getAddressIndex.optional(source)?.account;
  if (typeof account === 'undefined') {
    return false;
  }

  const hasUmInAccount = hasStakingToken(balancesResponses, stakingAssetMetadata, source);
  if (hasUmInAccount) {
    return false;
  }

  const accountAssets = balancesResponses.filter(
    balance => getAddressIndex.optional(balance)?.account === account,
  );
  // Finds the alt tokens in the user's account balances that can be used for fees
  const hasAltTokens = accountAssets.some(balance => {
    const amount = getAmount(balance);
    const hasBalance = amount.lo !== 0n || amount.hi !== 0n;
    if (!hasBalance) {
      return false;
    }

    return gasPrices.some(price =>
      price.assetId?.equals(getAssetIdFromBalancesResponse.optional(balance)),
    );
  });

  return hasAltTokens;
};

/**
 * Renders a non-native fee warning if
 * 1. the user does not have any balance (in the selected account) of the staking token to use for fees
 * 2. the user does not have sufficient balances in alternative tokens to cover the fees
 */
export const NonNativeFeeWarning = ({
  amount,
  balancesResponses,
  source,
  wrap = children => children,
}: {
  /**
   * The amount that the user is putting into this transaction, which will help
   * determine whether the warning should render.
   */
  amount: number;
  /**
   * The user's balances that are relevant to this transaction, from which
   * `<NonNativeFeeWarning />` will determine whether to render.
   */
  balancesResponses: BalancesResponse[] | undefined;
  /**
   * A source token – helps determine whether the user has UM token
   * in the same account as `source` to use for fees.
   */
  source: BalancesResponse | undefined;
  /*
   * Since this component determines for itself whether to render, a parent
   * component can't optionally render wrapper markup depending on whether this
   * component will render or not. To work around this, parent components can
   * pass a `wrap` function that takes a `children` argument, and provide
   * wrapper markup that will only be rendered if this component renders.
   *
   * @example
   * ```tsx
   * <NonNativeFeeWarning
   *   balancesResponses={balancesResponses}
   *   amount={amount}
   *   source={selectedBalancesResponse}
   *   wrap={children => <div className='mt-5'>{children}</div>}
   * />
   * ```
   */
  wrap?: (children: ReactNode) => ReactNode;
}) => {
  const { data } = useGasPrices();
  const stakingTokenMetadata = useStakingTokenMetadata();
  const shouldRender =
    !!amount &&
    hasRelevantAltTokenBalance({
      source,
      balancesResponses: balancesResponses ?? [],
      gasPrices: data ?? [],
      stakingAssetMetadata: stakingTokenMetadata.data,
    });
  if (!shouldRender) {
    return null;
  }

  return wrap(
    <div className='rounded border border-yellow-500 p-4 text-yellow-500'>
      <strong>Privacy Warning:</strong>
      <span className='block'>
        You are using an alternative token for transaction fees, which may pose a privacy risk. It
        is recommended to use the native token (UM) for better privacy and security.
      </span>
    </div>,
  );
};
