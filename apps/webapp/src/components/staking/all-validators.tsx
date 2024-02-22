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
        <ValidatorsTable {...validatorInfoContext} />
      </CardContent>
    </Card>
  );
};
