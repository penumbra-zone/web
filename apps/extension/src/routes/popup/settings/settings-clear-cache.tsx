import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Button } from 'ui/components';
import { FadeTransition, SettingsHeader } from '../../../shared';
import { TrashGradientIcon } from '../../../icons';

// Clearing cache should:
//  - Delete indexeddb database
//  - Restart block sync
//  - Redirect to popup index
export const SettingsClearCache = () => {
  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-6'>
        <SettingsHeader title='Clear cache' />
        <div className='mx-auto h-20 w-20'>
          <TrashGradientIcon />
        </div>
        <div className='flex flex-1 flex-col items-start justify-between px-[30px] pb-5'>
          <div className='flex flex-col items-center gap-2'>
            <p className='font-headline text-base font-semibold'>Are you sure?</p>
            <p className='text-center text-muted-foreground'>
              Do you really want to clear cache? All local data will be deleted and resynchronized.
            </p>
            <p className='mt-2 flex items-center gap-2 font-headline text-base font-semibold text-rust'>
              <ExclamationTriangleIcon className='h-[30px] w-[30px] text-rust' /> You private keys
              won’t be lost!
            </p>
          </div>
          <Button variant='gradient' size='lg' className='w-full'>
            Confirm
          </Button>
        </div>
      </div>
    </FadeTransition>
  );
};
