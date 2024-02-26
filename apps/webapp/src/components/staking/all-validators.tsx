import { ValidatorsTable } from './validators-table';
import { Card, CardHeader, CardTitle, CardContent } from '@penumbra-zone/ui';
import { useStore } from '../../state';
import { stakingSelector } from '../../state/staking';

/**
 * Renders all validators that the user has no delegation/unbonding tokens for.
 *
 * @todo: Filter out validators that the user has tokens for.
 */
export const AllValidators = () => {
  const validatorInfoContext = useStore(stakingSelector);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active validators</CardTitle>
      </CardHeader>
      <CardContent>
        {/** @todo: Render delegate button in the staking cell */}
        <ValidatorsTable {...validatorInfoContext} renderStakingActions={() => null} />
      </CardContent>
    </Card>
  );
};
