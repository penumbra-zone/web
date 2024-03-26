import { IbcInForm } from './ibc-in-form';
import { IbcOutForm } from './ibc-out-form';

export const IbcLayout = () => {
  return (
    <>
      <div className='fixed inset-0 z-[-100] size-full bg-logo-page bg-[length:160vmax] bg-fixed bg-[top_50%_left_25vw] bg-no-repeat'></div>
      <div className='flex grow flex-col place-content-between gap-6 md:flex-row'>
        <div className='basis-2/5 md:self-start'>
          <IbcInForm />
        </div>
        <div className='basis-2/5 md:self-end'>
          <IbcOutForm />
        </div>
      </div>
    </>
  );
};
