import { Card } from '@penumbra-zone/ui/components/ui/card';
import { IbcInForm } from './ibc-in-form';
import { IbcOutForm } from './ibc-out-form';

export const IbcLayout = () => {
  //div className='flex flex-1 flex-col gap-4 md:flex-row md:place-content-between'>
  return (
    <div className='flex flex-1 flex-col gap-4 md:flex-row  md:place-content-around'>
      <Card className='md:self-start'>
        <IbcInForm />
      </Card>
      <Card className='md:self-end'>
        <IbcOutForm />
      </Card>
    </div>
  );
};
