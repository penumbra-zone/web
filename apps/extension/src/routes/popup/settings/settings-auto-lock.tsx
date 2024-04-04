import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { TimerGradientIcon } from '../../../icons/time-gradient';
import { SettingsScreen } from './settings-screen';

export const SettingsAutoLock = () => {
  return (
    <SettingsScreen title='Auto-lock timer' IconComponent={TimerGradientIcon}>
      <div className='flex flex-1 flex-col items-start justify-between'>
        <div className='flex flex-col gap-1'>
          <p className='mb-1 font-headline text-base font-semibold'>Auto - lock timer (minutes)</p>
          <p className='text-muted-foreground'>
            Set the inactivity time in the coming minutes before Penumbra is blocked.
          </p>
          <Input />
        </div>
        <Button variant='gradient' size='lg' className='w-full'>
          Save
        </Button>
      </div>
    </SettingsScreen>
  );
};
