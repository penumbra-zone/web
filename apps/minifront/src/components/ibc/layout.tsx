import { IbcInForm } from './ibc-in-form';
import { IbcOutForm } from './ibc-out-form';

import '@interchain-ui/react/styles';

export const IbcLayout = () => {
  return (
    <div className='grid gap-8 md:grid-cols-2  lg:gap-[30%]'>
      <IbcInForm />
      <IbcOutForm />
    </div>
  );
};
