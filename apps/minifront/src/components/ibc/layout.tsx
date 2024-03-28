import { Card } from '@penumbra-zone/ui/components/ui/card';
import { IbcInForm } from './ibc-in-form';
import { IbcOutForm } from './ibc-out-form';

export const IbcLayout = () => {
  return (
    <>
      <div className='fixed inset-0 z-[-100] size-full bg-logo-page bg-[length:160vmax] bg-fixed bg-[top_50%_left_25vw] bg-no-repeat' />
      <div className='flex flex-1 flex-col gap-4 md:flex-row  md:place-content-around'>
        <Card light className='md:self-start'>
          <IbcInForm />
        </Card>
        <Card gradient className='md:self-end'>
          <IbcOutForm />
        </Card>
      </div>
    </>
  );
};
