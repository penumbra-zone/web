import { Button } from '@penumbra-zone/ui/components/ui/button';
import { LockClosedIcon } from '@radix-ui/react-icons';
import { InterchainUi } from './interchain-ui';
import { useStore } from '../../../state';
import { ibcInSelector } from '../../../state/ibc-in';

export const IbcInForm = () => {
  const { ready } = useStore(ibcInSelector);

  return (
    <form
      className='flex w-full flex-col gap-4 md:w-[340px] xl:w-[450px]'
      onSubmit={e => {
        e.preventDefault();
      }}
    >
      <InterchainUi />
      {ready && (
        <Button type='submit' variant='onLight' disabled>
          <div className='flex items-center gap-2'>
            <LockClosedIcon />
            <span className='-mb-1'>Shield Assets</span>
          </div>
        </Button>
      )}
    </form>
  );
};
