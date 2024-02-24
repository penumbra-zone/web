import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { ValidatorInfoComponent } from './validator-info-component';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { StakingActions } from './staking-actions';
import { getAmountFromValueView, joinLoHiAmount } from '@penumbra-zone/types';

/**
 * Renders a `ValueView` that contains a delegation token, along with the
 * validator that the token is staked in.
 *
 * @todo: Eventually, we want to move validator info into the `ValueView` of a
 * delegation token (under the `extendedMetadata` property). When we do, we can
 * remove the `validatorInfo` prop and simply render the validator info from the
 * `ValidatorInfo` inside the `ValueView`. (And, depending on the outcome of
 * https://github.com/penumbra-zone/penumbra/issues/3882, we may even be able to
 * remove `votingPowerAsIntegerPercentage`.)
 */
export const DelegationValueView = ({
  validatorInfo,
  valueView,
  votingPowerAsIntegerPercentage,
  canDelegate,
}: {
  validatorInfo: ValidatorInfo;
  valueView?: ValueView;
  votingPowerAsIntegerPercentage?: number;
  canDelegate: boolean;
}) => {
  const delegationBalance = getAmountFromValueView.optional()(valueView);
  const canUndelegate = delegationBalance ? !!joinLoHiAmount(delegationBalance) : false;

  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:gap-8'>
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
