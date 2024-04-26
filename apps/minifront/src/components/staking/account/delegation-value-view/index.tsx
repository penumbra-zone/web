import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValidatorInfoComponent } from './validator-info-component';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { StakingActions } from './staking-actions';
import { memo, useMemo } from 'react';
import {
  getDisplayDenomFromView,
  getEquivalentValues,
  getMetadata,
  getValidatorInfoFromValueView,
} from '@penumbra-zone/getters/src/value-view';
import { asValueView } from '@penumbra-zone/getters/src/equivalent-value';

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
    stakingTokenMetadata,
  }: {
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
    stakingTokenMetadata: Metadata;
  }) => {
    const validatorInfo = getValidatorInfoFromValueView(valueView);
    const metadata = getMetadata(valueView);

    const equivalentValueOfStakingToken = useMemo(() => {
      const equivalentValue = getEquivalentValues(valueView).find(equivalentValue =>
        equivalentValue.numeraire?.penumbraAssetId?.equals(stakingTokenMetadata.penumbraAssetId),
      );

      if (equivalentValue) return asValueView(equivalentValue);
      return undefined;
    }, [valueView, stakingTokenMetadata.penumbraAssetId]);

    return (
      <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8'>
        <div className='min-w-0 shrink grow'>
          <ValidatorInfoComponent
            validatorInfo={validatorInfo}
            votingPowerAsIntegerPercentage={votingPowerAsIntegerPercentage}
            delegationTokenMetadata={metadata}
          />
        </div>

        <div className='w-[200px] shrink-0'>
          <ValueViewComponent view={valueView} />

          {equivalentValueOfStakingToken && (
            <ValueViewComponent
              key={getDisplayDenomFromView(equivalentValueOfStakingToken)}
              view={equivalentValueOfStakingToken}
              variant='equivalent'
            />
          )}
        </div>

        <StakingActions
          validatorInfo={validatorInfo}
          delegationTokens={valueView}
          unstakedTokens={unstakedTokens}
        />
      </div>
    );
  },
);
DelegationValueView.displayName = 'DelegationValueView';
