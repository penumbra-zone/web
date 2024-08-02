import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { useStakingTokenMetadata } from '../../state/shared';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import {
  getAddressIndex,
  getAmount,
  getAssetIdFromBalancesResponseOptional,
} from '@penumbra-zone/getters/balances-response';
import { viewClient } from '../../clients.ts';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';
import { getAssetId } from '@penumbra-zone/getters/metadata';

// Finds the UM token in the user's account balances
const hasStakingToken = (
  account: number,
  balancesResponses: BalancesResponse[] = [],
  stakingAssetMetadata?: Metadata,
): boolean => {
  return balancesResponses.some(
    asset =>
      getAssetIdFromValueView
        .optional()(asset.balanceView)
        ?.equals(getAssetId.optional()(stakingAssetMetadata)) &&
      getAddressIndex.optional()(asset)?.account === account,
  );
};

// Finds the alt tokens in the user's account balances that can be used for fees
const hasAltToken = (
  account: number,
  balancesResponses: BalancesResponse[] = [],
  gasPrices: GasPrices[],
) => {
  const accountAssets = balancesResponses.filter(
    balance => getAddressIndex.optional()(balance)?.account === account,
  );
  return accountAssets.some(balance => {
    const amount = getAmount(balance);
    const hasBalance = amount.lo !== 0n || amount.hi !== 0n;
    if (!hasBalance) {
      return false;
    }

    return gasPrices.some(price =>
      price.assetId?.equals(getAssetIdFromBalancesResponseOptional(balance)),
    );
  });
};

const useGasPrices = () => {
  const [prices, setPrices] = useState<GasPrices[]>([]);

  const fetchGasPrices = useCallback(async () => {
    const res = await viewClient.gasPrices({});
    setPrices(res.altGasPrices);
  }, []);

  useEffect(() => {
    void fetchGasPrices();
  }, [fetchGasPrices]);

  return prices;
};

// Returns boolean if the Alt fees will be used for transaction
export const useShouldRender = (
  balancesResponses: BalancesResponse[] = [],
  amount: number,
  account?: BalancesResponse,
) => {
  const gasPrices = useGasPrices();
  const stakingTokenMetadata = useStakingTokenMetadata();

  if (!amount) {
    return false;
  }

  const sourceAddressIndex = getAddressIndex.optional()(account)?.account ?? 0;
  const userHasStakingToken = hasStakingToken(
    sourceAddressIndex,
    balancesResponses,
    stakingTokenMetadata.data,
  );

  if (userHasStakingToken) {
    return true;
  }

  return hasAltToken(sourceAddressIndex, balancesResponses, gasPrices);
};

/**
 * Renders a non-native fee warning if
 * 1. the user does not have any balance (in the selected account) of the staking token to use for fees
 * 2. user has alt token balances to pay for the fees
 */
export const NonNativeFeeWarning = ({
  balancesResponses,
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
   *   account={account}
   *   wrap={children => <div className='mt-5'>{children}</div>}
   * />
   * ```
   */
  wrap?: (children: ReactNode) => ReactNode;
}) => {
  const shouldRender = useShouldRender(balancesResponses, amount, source);

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
