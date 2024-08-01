import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import { useStakingTokenMetadata } from '../../state/shared';
import { ReactNode } from 'react';
import { getAddressIndex } from '@penumbra-zone/getters/balances-response';

const hasStakingToken = (
  balancesResponses: BalancesResponse[] = [],
  stakingAssetMetadata?: Metadata,
  account?: number,
): boolean => {
  return balancesResponses.some(
    asset =>
      getAssetIdFromValueView
        .optional()(asset.balanceView)
        ?.equals(getAssetId.optional()(stakingAssetMetadata)) &&
      getAddressIndex.optional()(asset)?.account === account,
  );
};

export const useShouldRender = (
  balancesResponses: BalancesResponse[] = [],
  amount: number,
  account?: BalancesResponse,
) => {
  const stakingTokenMetadata = useStakingTokenMetadata();
  const sourceAddressIndex = getAddressIndex.optional()(account)?.account ?? 0;
  const userHasStakingToken = hasStakingToken(
    balancesResponses,
    stakingTokenMetadata.data,
    sourceAddressIndex,
  );
  const showNonNativeFeeWarning = amount > 0 && !userHasStakingToken;

  return showNonNativeFeeWarning;
};

/**
 * Renders a non-native fee warning if A) the user does not have any balance of
 * the staking token to use for fees, and B) the amount the user has entered for
 * a transaction (e.g., send or swap) is nonzero -- i.e., a fee will be
 * required.
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
