import { Card } from '@penumbra-zone/ui/components/ui/card';
import { IbcOutForm } from './ibc-out/ibc-out-form';
import { InterchainUi } from './ibc-in/interchain-ui';
import { LongArrowIcon } from './long-arrow';

export const IbcLayout = () => {
  return (
    <>
      <div className="fixed inset-0 z-[-100] size-full bg-[url('penumbra-logo.svg')] bg-[length:160vmax] bg-fixed bg-[top_50%_left_25vw] bg-no-repeat" />
      <div className='flex flex-1 flex-col gap-4 md:flex-row md:place-content-around'>
        <Card light className='relative z-10 overflow-visible md:self-start'>
          <LongArrowIcon
            direction='right'
            className='invisible absolute -top-32 right-0 z-0 -mr-80 size-80 text-stone-300 md:visible'
          />
          <InterchainUi />
        </Card>
        <Card gradient className='relative overflow-visible md:mt-40 md:self-start'>
          <LongArrowIcon
            direction='left'
            className='invisible absolute -bottom-32 left-0 z-0 my-auto -ml-80 size-80 text-stone-700 md:visible'
          />
          <IbcOutForm />
        </Card>
      </div>
    </>
  );
};
