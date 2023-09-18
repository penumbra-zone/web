import { Button, Input } from 'ui/components';
import { FadeTransition, SettingsHeader } from '../../../../shared';
import { TimerGradientIcon } from './icon';

export const SettingsAutoLock = () => {
  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Auto-lock timer' />
        <div className='mx-auto h-[60px] w-[60px]'>
          <TimerGradientIcon />
        </div>
        <div className='flex flex-1 flex-col items-start justify-between px-[30px] pb-[30px]'>
          <div className='flex flex-col gap-2'>
            <p className='font-headline text-xl-semibold'>Auto - lock timer (minutes)</p>
            <p className='text-base-bold text-muted-foreground'>
              Set the inactivity time in the coming minutes before Penumbra is blocked.
            </p>
            <Input />
          </div>
          <Button variant='gradient' className='h-11 w-full'>
            Save
          </Button>
        </div>
      </div>
    </FadeTransition>
  );
};
