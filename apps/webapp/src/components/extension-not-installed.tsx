import { Button } from '@penumbra-zone/ui';
import { HeadTag } from './metadata/head-tag';
import { EduInfoCard } from './shared/edu-panels/edu-info-card';

const CHROME_EXTENSION_ID = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';

export const ExtensionNotInstalled = () => {
  return (
    <>
      <HeadTag />
      <main className='flex h-screen items-center justify-center'>
        <EduInfoCard
          className='order-1 md:order-2'
          src='./receive-gradient.svg'
          label='Install our extension'
        >
          <div className='flex items-center gap-4'>
            You need to install the Penumbra Chrome extension to use this app.
            <Button asChild className='px-4 text-white'>
              <a
                href={`https://chrome.google.com/webstore/detail/penumbra-wallet/${CHROME_EXTENSION_ID}`}
                target='_blank'
                rel='noreferrer'
              >
                Install
              </a>
            </Button>
          </div>
        </EduInfoCard>
      </main>
    </>
  );
};
