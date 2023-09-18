import { Button, Popover, PopoverContent, PopoverTrigger } from 'ui/components';
import { FadeTransition, SettingsHeader } from '../../shared';
import { useStore } from '../../state';
import { walletsSelector } from '../../state/wallets';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { usePopupNav } from '../../utils/navigate';
import { PopupPath } from './paths';

export const Accounts = () => {
  const navigate = usePopupNav();
  const { all } = useStore(walletsSelector);

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col justify-between gap-6'>
        <SettingsHeader title='Select Wallet' />
        <div className='flex flex-1 flex-col items-start gap-4 px-[30px]'>
          <Button className='h-9 w-full' variant='gradient'>
            Add Wallet
          </Button>
          <div className='flex w-full items-center justify-between gap-1 rounded-lg border bg-background px-3 py-[10px]'>
            <div className='flex items-center gap-4'>
              <img
                src='https://avatar.vercel.sh/rauchg'
                alt='icon'
                className='h-6 w-6 rounded-full'
              />
              <div className='flex flex-col text-base-bold'>
                <p>{all[0]?.label}</p>
                <p className='text-muted-foreground'>penumbrav2t156t9s3s0786ghjnpk20jjawe..</p>
              </div>
            </div>
            <Popover>
              <PopoverTrigger>
                <DotsVerticalIcon className='h-5 w-5 cursor-pointer hover:opacity-50' />
              </PopoverTrigger>
              <PopoverContent align='center' className='w-[240px] p-0 pb-3'>
                <Button
                  onClick={() => navigate(PopupPath.SETTINGS_RECOVERY_PASSPHRASE)}
                  variant='outline'
                  className='flex h-11 w-full justify-start px-5'
                >
                  View Recovery Passphrase
                </Button>
                <Button
                  onClick={() => navigate(PopupPath.SETTINGS_FVK)}
                  variant='outline'
                  className='flex h-11 w-full justify-start px-5'
                >
                  View Full Viewing Key
                </Button>
                <Button
                  onClick={() => navigate(PopupPath.SETTINGS_SK)}
                  variant='outline'
                  className='flex h-11 w-full justify-start px-5'
                >
                  View Spend key
                </Button>
                <Button variant='outline' className='flex h-11 w-full justify-start px-5'>
                  Change Wallet Name
                </Button>
                <Button variant='outline' className='flex h-11 w-full justify-start px-5'>
                  Delete Wallet
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </FadeTransition>
  );
};
