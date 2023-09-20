import { useParams } from 'react-router-dom';
import { FadeTransition, SettingsHeader } from '../../../shared';
import { Button, Input } from 'ui/components';
import { useStore } from '../../../state';
import { networkSelector } from '../../../state/network';

export const SettingsNetworkEdit = () => {
  const { name } = useParams();
  const { grpcEndpoint } = useStore(networkSelector);

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-6'>
        <SettingsHeader title='Edit Network' />
        <div className='flex flex-1 flex-col items-start justify-between px-[30px] pb-[30px]'>
          <div className='flex w-full flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <p className='font-headline text-base font-semibold'>Network name</p>
              <Input readOnly value={name} className='text-muted-foreground' />
            </div>
            <div className='flex flex-col gap-2'>
              <p className='font-headline text-base font-semibold'>Network name</p>
              <Input value={grpcEndpoint} className='text-muted-foreground' />
            </div>
          </div>
          <Button variant='gradient' size='lg' className='w-full'>
            Save
          </Button>
        </div>
      </div>
    </FadeTransition>
  );
};
