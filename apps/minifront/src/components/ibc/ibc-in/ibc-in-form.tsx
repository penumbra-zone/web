import { Button } from '@penumbra-zone/ui/components/ui/button';
import { LockClosedIcon } from '@radix-ui/react-icons';
import { InterchainUi } from './interchain-ui';

export const IbcInForm = () => {
  return (
    <form
      className='flex w-full flex-col gap-4 md:w-[340px] xl:w-[450px]'
      onSubmit={e => {
        e.preventDefault();
      }}
    >
      <InterchainUi />
      <Button type='submit' variant='onLight'>
        <div className='flex items-center gap-2'>
          <LockClosedIcon />
          <span className='-mb-1'>Shield Assets</span>
        </div>
      </Button>
    </form>
  );
};
