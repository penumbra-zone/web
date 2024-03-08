import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValidatorInfoComponent } from './validator-info-component';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { StakingActions } from './staking-actions';
import { getValidatorInfoFromValueView } from '@penumbra-zone/getters';
import { memo } from 'react';
import { StakingSlice } from '../../../../state/staking';

/**
 * Properties from Zustand state to pass to child components. This isn't
 * strictly necessary -- the child components could grab them from state
 * themselves -- but since this component is memoized, there's a performance
 * benefit to passing these props down so that the child components don't
 * constantly re-render.
 */
type PropsFromState = Pick<
  StakingSlice,
  | 'action'
  | 'amount'
  | 'onClickActionButton'
  | 'delegate'
  | 'loading'
  | 'undelegate'
  | 'onClose'
  | 'setAmount'
  | 'validatorInfo'
>;

/**
 * Renders a `ValueView` that contains a delegation token, along with the
 * validator that the token is staked in.
 *
 * @todo: Depending on the outcome of
 * https://github.com/penumbra-zone/penumbra/issues/3882, we may be able to
 * remove `votingPowerAsIntegerPercentage`.
 */
export const DelegationValueView = memo(
  ({
    valueView,
    votingPowerAsIntegerPercentage,
    unstakedTokens,

    delegate,
    onClickActionButton,
    onClose,
    setAmount,
    undelegate,
    action,
    amount,
    validatorInfo: selectedValidatorInfo,
    loading,
  }: PropsFromState & {
    /**
     * A `ValueView` representing the address's balance of the given delegation
     * token.
     */
    valueView: ValueView;
    votingPowerAsIntegerPercentage?: number;
    /**
     * A `ValueView` representing the address's balance of staking (UM) tokens.
     * Used to show the user how many tokens they have available to delegate.
     */
    unstakedTokens?: ValueView;
  }) => {
    const validatorInfoFromValueView = getValidatorInfoFromValueView(valueView);

    return (
      <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8'>
        <div className='min-w-0 shrink grow'>
          <ValidatorInfoComponent
            validatorInfo={validatorInfoFromValueView}
            votingPowerAsIntegerPercentage={votingPowerAsIntegerPercentage}
            // The tooltip component is a bit heavy to render, so we'll wait to
            // render it until all loading completes.
            showTooltips={!loading}
          />
        </div>

        <div className='shrink lg:max-w-[200px]'>
          <ValueViewComponent view={valueView} />
        </div>

        <StakingActions
          validatorInfo={validatorInfoFromValueView}
          delegationTokens={valueView}
          unstakedTokens={unstakedTokens}
          amount={amount}
          delegate={delegate}
          onClickActionButton={onClickActionButton}
          onClose={onClose}
          selectedValidatorInfo={selectedValidatorInfo}
          setAmount={setAmount}
          undelegate={undelegate}
          action={action}
        />
      </div>
    );
  },
);
DelegationValueView.displayName = 'DelegationValueView';
