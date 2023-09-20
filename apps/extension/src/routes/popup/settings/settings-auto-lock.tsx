import { Button, Input } from 'ui/components';
import { FadeTransition, SettingsHeader } from '../../../shared';
import { TimerGradientIcon } from '../../../icons';

export const SettingsAutoLock = () => {
  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-6'>
        <SettingsHeader title='Auto-lock timer' />
        <div className='mx-auto h-20 w-20'>
          <TimerGradientIcon />
        </div>
        <div className='flex flex-1 flex-col items-start justify-between px-[30px] pb-5'>
          <div className='flex flex-col gap-1'>
            <p className='mb-1 font-headline text-base font-semibold'>
              Auto - lock timer (minutes)
            </p>
            <p className='text-muted-foreground'>
              Set the inactivity time in the coming minutes before Penumbra is blocked.
            </p>
            <Input />
          </div>
          <Button variant='gradient' size='lg' className='w-full'>
            Save
          </Button>
        </div>
      </div>
    </FadeTransition>
  );
};
