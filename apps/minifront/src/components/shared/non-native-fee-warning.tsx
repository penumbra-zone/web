import { ReactNode } from 'react';

/**
 * Renders a non-native fee warning if
 * 1. the user does not have any balance (in the selected account) of the staking token to use for fees
 * 2. the user does not have sufficient balances in alternative tokens to cover the fees
 */
export const NonNativeFeeWarning = ({
  amount,
  hasStakingToken,
  wrap = children => children,
}: {
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
   *   source={selectedBalancesResponse}
   *   wrap={children => <div className='mt-5'>{children}</div>}
   * />
   * ```
   */
  hasStakingToken: boolean;
  wrap?: (children: ReactNode) => ReactNode;
}) => {
  const shouldRender = !!amount && !hasStakingToken;
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
