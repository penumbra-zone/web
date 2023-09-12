import { ExclamationTriangleIcon, TrashIcon } from '@radix-ui/react-icons';
import { FadeTransition, SettingsHeader } from '../../../shared';
import { Button } from 'ui/components';

// There we shold clear indexedDB, balances; stop sync, logout
export const SettingsClearCache = () => {
  return (
    <FadeTransition>
      <div className='min-h-[100vh] w-[100vw] flex flex-col gap-10'>
        <SettingsHeader title='Clear cache' />
        <TrashIcon className=' h-[60px] w-[60px] text-muted-foreground mx-auto' />
        <div className='flex flex-1 flex-col items-start justify-between px-[30px] pb-[30px]'>
          <div className='flex flex-col items-center gap-2'>
            <p className='text-xl_semiBold font-headline'>Are you sure?</p>
            <p className='text-base_bold text-muted-foreground text-center'>
              Do you really want to clear cache? All view service data will be deleted and
              resynchronized.
            </p>
            <p className='flex items-center gap-2 xl_semiBold font-headline text-rust mt-4'>
              <ExclamationTriangleIcon className='w-[30px] h-[30px] text-rust' /> You private keys
              won’t be lost!
            </p>
          </div>
          <Button variant='gradient' className='w-full h-11'>
            Confirm
          </Button>
        </div>
      </div>
    </FadeTransition>
  );
};
