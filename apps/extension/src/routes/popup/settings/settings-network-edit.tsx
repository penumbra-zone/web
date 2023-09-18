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
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Edit network' />
        <div className='flex flex-1 flex-col items-start justify-between px-[30px] pb-[30px]'>
          <div className='flex w-full flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <p className='font-headline text-xl-semibold'>Network name</p>
              <Input readOnly value={name} />
            </div>
            <div className='flex flex-col gap-2'>
              <p className='font-headline text-xl-semibold'>Network name</p>
              <Input value={grpcEndpoint} />
            </div>
          </div>
          <Button variant='gradient' className='h-11 w-full'>
            Save
          </Button>
        </div>
      </div>
    </FadeTransition>
  );
};
