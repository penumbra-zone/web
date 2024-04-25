import { Card } from '@penumbra-zone/ui/components/ui/card';
import { IbcOutForm } from './ibc-out/ibc-out-form';
import { IbcInForm } from './ibc-in/ibc-in-form';
import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons';

export const IbcLayout = () => {
  return (
    <>
      <div className="fixed inset-0 z-[-100] size-full bg-[url('penumbra-logo.svg')] bg-[length:160vmax] bg-fixed bg-[top_50%_left_25vw] bg-no-repeat" />
      <div className='flex flex-1 flex-col gap-4 md:flex-row md:place-content-around'>
        <Card light className='relative overflow-visible md:self-end'>
          <ArrowRightIcon className='absolute inset-y-0 right-0 z-10 my-auto -mr-14 size-16 text-stone-300' />
          <IbcInForm />
        </Card>
        <Card gradient className='relative overflow-visible md:self-start'>
          <ArrowLeftIcon className='absolute inset-y-0 left-0 z-10 my-auto -ml-14 size-16 text-stone-700' />
          <IbcOutForm />
        </Card>
      </div>
    </>
  );
};
