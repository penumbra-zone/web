import { Card, CardHeader, CardTitle, CardContent } from '@penumbra-zone/ui';
import { useStore } from '../../state';
import { stakingSelector } from '../../state/staking';
import { DelegationValueView } from './accounts/account/delegation-value-view';
import { getValidator } from '@penumbra-zone/types';

/**
 * Renders all validators that the user has no delegation/unbonding tokens for.
 *
 * @todo: Filter out validators that the user has tokens for.
 */
export const AllValidators = () => {
  const { votingPowerByValidatorInfo, validatorInfos } = useStore(stakingSelector);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active validators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='mt-8 flex flex-col gap-8'>
          {validatorInfos.map(validatorInfo => (
            <DelegationValueView
              key={getValidator(validatorInfo).name}
              validatorInfo={validatorInfo}
              canDelegate={false}
              votingPowerAsIntegerPercentage={votingPowerByValidatorInfo.get(validatorInfo)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
