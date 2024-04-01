import { Card } from '@penumbra-zone/ui/components/ui/card';
import { FadeTransition } from '@penumbra-zone/ui/components/ui/fade-transition';

export const SetRpcEndpoint = () => {
  return (
    <FadeTransition>
      <Card className='w-[400px]' gradient>
        <div>Hello, world!</div>
      </Card>
    </FadeTransition>
  );
};
