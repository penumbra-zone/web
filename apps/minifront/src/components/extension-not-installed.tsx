import { Button } from '@penumbra-zone/ui/components/ui/button';
import { SplashPage } from '@penumbra-zone/ui/components/ui/splash-page';
import { HeadTag } from './metadata/head-tag';

const CHROME_EXTENSION_ID = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';

export const ExtensionNotInstalled = () => {
  return (
    <>
      <HeadTag />
      <SplashPage title='Welcome to Penumbra'>
        <div className='flex items-center justify-between gap-[1em] text-lg'>
          To get started, install the Penumbra Chrome extension.
          <Button asChild variant='gradient'>
            <a
              href={`https://chrome.google.com/webstore/detail/penumbra-wallet/${CHROME_EXTENSION_ID}`}
              target='_blank'
              rel='noreferrer'
            >
              Install
            </a>
          </Button>
        </div>
      </SplashPage>
    </>
  );
};
