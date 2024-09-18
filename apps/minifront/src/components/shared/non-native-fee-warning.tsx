import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { useStakingTokenMetadata } from '../../state/shared';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import {
  getAddressIndex,
  getAmount,
  getAssetIdFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { ViewService } from '@penumbra-zone/protobuf';
import { GasPrices } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import { penumbra } from '../../prax';

const hasTokenBalance = ({
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

  // Finds the UM token in the user's account balances
  const hasStakingToken = balancesResponses.some(
    asset =>
      getAssetIdFromValueView
        .optional(asset.balanceView)
        ?.equals(getAssetId.optional(stakingAssetMetadata)) &&
      getAddressIndex.optional(asset)?.account === account,
  );

  if (hasStakingToken) {
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

const useGasPrices = () => {
  const [prices, setPrices] = useState<GasPrices[]>([]);

  const fetchGasPrices = useCallback(async () => {
    const res = await penumbra.service(ViewService).gasPrices({});
    setPrices(res.altGasPrices);
  }, []);

  useEffect(() => {
    void fetchGasPrices();
  }, [fetchGasPrices]);

  return prices;
};

/**
 * Renders a non-native fee warning if
 * 1. the user does not have any balance (in the selected account) of the staking token to use for fees
 * 2. the user does not have sufficient balances in alternative tokens to cover the fees
 */
export const NonNativeFeeWarning = ({
  balancesResponses = [],
  amount,
  source,
  wrap = children => children,
}: {
  /**
   * The user's balances that are relevant to this transaction, from which
   * `<NonNativeFeeWarning />` will determine whether to render.
   */
  balancesResponses?: BalancesResponse[];
  /**
   * The amount that the user is putting into this transaction, which will help
   * determine whether the warning should render.
   */
  amount: number;
  /**
   * A source token – helps determine whether the user has UM token
   * in the same account as `source` to use for fees.
   */
  source?: BalancesResponse;
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
  const gasPrices = useGasPrices();
  const stakingTokenMetadata = useStakingTokenMetadata();
  const shouldRender =
    !!amount &&
    hasTokenBalance({
      source,
      balancesResponses,
      gasPrices,
      stakingAssetMetadata: stakingTokenMetadata.data,
    });

  if (!shouldRender) {
    return null;
  }

  return wrap(
    <div className='rounded border border-yellow-500 p-4 text-yellow-500'>
      <strong>Privacy Warning:</strong>
      <span className='block'>
        Using non-native tokens for transaction fees may pose a privacy risk. It is recommended to
        use the native token (UM) for better privacy and security.
      </span>
    </div>,
  );
};
