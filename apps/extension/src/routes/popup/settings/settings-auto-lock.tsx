import { TimerIcon } from '@radix-ui/react-icons';
import { FadeTransition, SettingsHeader } from '../../../shared';
import { Button, Input } from 'ui/components';

export const SettingsAutoLock = () => {
  return (
    <FadeTransition>
      <div className='min-h-[100vh] w-[100vw] flex flex-col gap-10'>
        <SettingsHeader title='Auto-lock timer' />
        <TimerIcon className=' h-[60px] w-[60px] text-muted-foreground mx-auto' />
        <div className='flex flex-1 flex-col items-start justify-between px-[30px] pb-[30px]'>
          <div className='flex flex-col gap-2'>
            <p className='text-xl_semiBold font-headline'>Auto - lock timer (minutes)</p>
            <p className='text-base_bold text-muted-foreground'>
              Set the inactivity time in the coming minutes before Penumbra is blocked.
            </p>
            <Input />
          </div>
          <Button variant='gradient' className='w-full h-11'>
            Save
          </Button>
        </div>
      </div>
    </FadeTransition>
  );
};
