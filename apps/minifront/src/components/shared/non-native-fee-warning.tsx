import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import { useStakingTokenMetadata } from '../../state/shared';
import { ReactNode } from 'react';

const hasStakingToken = (
  balancesResponses: BalancesResponse[] = [],
  stakingAssetMetadata?: Metadata,
): boolean => {
  return balancesResponses.some(asset =>
    getAssetIdFromValueView
      .optional()(asset.balanceView)
      ?.equals(getAssetId.optional()(stakingAssetMetadata)),
  );
};

export const useShouldRender = (balancesResponses: BalancesResponse[] = [], amount: number) => {
  const stakingTokenMetadata = useStakingTokenMetadata();
  const userHasStakingToken = hasStakingToken(balancesResponses, stakingTokenMetadata.data);
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
   *   wrap={children => <div className='mt-5'>{children}</div>}
   * />
   * ```
   */
  wrap?: (children: ReactNode) => ReactNode;
}) => {
  const shouldRender = useShouldRender(balancesResponses, amount);

  if (!shouldRender) return null;

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
