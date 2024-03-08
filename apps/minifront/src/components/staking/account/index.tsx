import { Card, CardContent, CardHeader, CardTitle } from '@penumbra-zone/ui';
import { Header } from './header';
import { Delegations } from './delegations';

export const Account = () => {
  return (
    <div className='flex flex-col gap-4'>
      <Header />

      <Card>
        <CardHeader>
          <CardTitle>Delegation tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <Delegations />
        </CardContent>
      </Card>
    </div>
  );
};
