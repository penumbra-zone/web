import { Button } from 'ui/components';
import { FadeTransition, SettingsHeader } from '../../../shared';
import { useStore } from '../../../state';
import { walletsSelector } from '../../../state/wallets';
import { AccountPopover } from './account-popover';

export const Accounts = () => {
  const { all } = useStore(walletsSelector);

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col justify-between gap-6'>
        <SettingsHeader title='Select Account' />
        <div className='flex flex-1 flex-col items-start gap-4 px-[30px]'>
          <Button className='h-9 w-full' variant='gradient'>
            Add Account
          </Button>
          <div className='flex w-full items-center justify-between gap-1 rounded-lg border bg-background px-3 py-2'>
            <div className='flex items-center gap-4'>
              <img
                src='https://avatar.vercel.sh/rauchg'
                alt='icon'
                className='h-6 w-6 rounded-full'
              />
              <div className='flex flex-col'>
                <p>{all[0]?.label}</p>
                <p className='text-muted-foreground'>penumbrav2t156t9s3s0786ghjnpk20jjawe..</p>
              </div>
            </div>
            <AccountPopover />
          </div>
        </div>
      </div>
    </FadeTransition>
  );
};
