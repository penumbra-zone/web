import { SplashPage } from '@repo/ui/components/ui/splash-page';
import { HeadTag } from './metadata/head-tag';
import { Button } from '@repo/ui/components/ui/button';

export const ExtensionTransportDisconnected = () => {
  return (
    <>
      <HeadTag />
      <SplashPage title='Penumbra disconnected'>
        <div className='flex items-center justify-between gap-[1em] text-lg'>
          <div>
            Communication with your Penumbra extension has been interrupted. Reloading the page may
            re-establish the conneciton.
          </div>
          <Button variant='gradient' onClick={() => location.reload()}>
            Reload
          </Button>
        </div>
      </SplashPage>
    </>
  );
};
