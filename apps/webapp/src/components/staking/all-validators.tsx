import { useContext } from 'react';
import { ValidatorInfoContext } from './validator-info-context';
import { ValidatorsTable } from './validators-table';
import { Card, CardHeader, CardTitle, CardContent } from '@penumbra-zone/ui';

export const AllValidators = () => {
  const validatorInfoContext = useContext(ValidatorInfoContext);

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
