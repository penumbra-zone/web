import { Card } from '@penumbra-zone/ui/components/ui/card';
import { RestrictMaxWidth } from '../shared/restrict-max-width';
import { SwapForm } from './swap/swap-form';

export const SwapLayout = () => {
  return (
    <RestrictMaxWidth>
      <div className='grid w-full md:grid-cols-3'>
        <div className='overflow-hidden md:col-span-2'>
          <Card>
            <SwapForm />
          </Card>
        </div>
      </div>
    </RestrictMaxWidth>
  );
};
