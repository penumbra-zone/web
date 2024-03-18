import { IbcInForm } from './ibc-in-form';
import { IbcOutForm } from './ibc-out-form';

// <div className='grid gap-6 md:grid-cols-2 md:gap-4 xl:grid-cols-3 xl:gap-5'>
// <Card gradient className='order-3 row-span-2 flex-1 p-5 md:order-1 md:p-4 xl:p-5'>
// className='absolute inset-x-0 top-[-75px] z-0 mx-auto h-[141px] w-[136px] rotate-[320deg] md:left-[-100px] md:top-[-140px] md:mx-0 md:size-[234px]'

export const IbcLayout = () => {
  return (
    <div className='grid md:grid-cols-2 md:gap-5'>
      <IbcInForm />
      <IbcOutForm />
    </div>
  );
};
