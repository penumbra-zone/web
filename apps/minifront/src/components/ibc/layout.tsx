import { IbcInForm } from './ibc-in-form';
import { IbcOutForm } from './ibc-out-form';

export const IbcLayout = () => {
  return (
    <div className='grid md:grid-cols-2 md:gap-5'>
      <IbcInForm />
      <IbcOutForm />
    </div>
  );
};
