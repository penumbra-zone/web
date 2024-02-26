import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValidatorInfoComponent } from './validator-info-component';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { StakingActions } from './staking-actions';
import { getAmount, getValidatorInfoFromValueView, joinLoHiAmount } from '@penumbra-zone/types';

/**
 * Renders a `ValueView` that contains a delegation token, along with the
 * validator that the token is staked in.
 *
 * @todo: Depending on the outcome of
 * https://github.com/penumbra-zone/penumbra/issues/3882, we may be able to
 * remove `votingPowerAsIntegerPercentage`.
 */
export const DelegationValueView = ({
  valueView,
  votingPowerAsIntegerPercentage,
  canDelegate,
}: {
  valueView?: ValueView;
  votingPowerAsIntegerPercentage?: number;
  canDelegate: boolean;
}) => {
  const delegationBalance = getAmount.optional()(valueView);
  const canUndelegate = delegationBalance ? !!joinLoHiAmount(delegationBalance) : false;
  const validatorInfo = getValidatorInfoFromValueView(valueView);

  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8'>
      <div className='min-w-0 shrink grow'>
        <ValidatorInfoComponent
          validatorInfo={validatorInfo}
          votingPowerAsIntegerPercentage={votingPowerAsIntegerPercentage}
        />
      </div>

      <div className='shrink lg:max-w-[200px]'>
        <ValueViewComponent view={valueView} />
      </div>

      <StakingActions canDelegate={canDelegate} canUndelegate={canUndelegate} />
    </div>
  );
};
