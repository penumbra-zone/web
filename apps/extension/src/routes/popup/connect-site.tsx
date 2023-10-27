import { Button } from '@penumbra-zone/ui';
import { useMemo } from 'react';
import { redirect, useSearchParams } from 'react-router-dom';
import { useStore } from '../../state';
import { connectedSitesSelector } from '../../state/connected-sites';
import { localExtStorage, sessionExtStorage } from '@penumbra-zone/storage';
import { PopupPath } from './paths';

export const popupConnectSiteLoader = async () => {
  const wallets = await localExtStorage.get('wallets');

  if (!wallets.length) {
    await chrome.tabs.create({ url: chrome.runtime.getURL('page.html') });
    window.close();
  }

  const password = await sessionExtStorage.get('passwordKey');

  if (!password) return redirect(PopupPath.LOGIN);

  return null;
};

export const ConnectSite = () => {
  const [searchParams] = useSearchParams();
  const { addOrigin } = useStore(connectedSitesSelector);

  const origin = useMemo(() => searchParams.get('origin'), [searchParams]);

  return (
    <div className='flex min-h-screen w-full flex-col justify-between p-[30px]'>
      <div className='flex flex-col items-center gap-4'>
        <div className='mb-6 h-20 w-[150px]'>
          <img src='/logo.svg' alt='logo' />
        </div>
        <p className='font-headline text-xl font-semibold leading-[30px]'>Requesting Connection</p>
        <p className='font-headline text-base font-semibold text-muted-foreground'>{origin}</p>
      </div>
      <div className='flex gap-5'>
        <Button variant='secondary' className='w-[50%]' size='lg' onClick={() => window.close()}>
          Reject
        </Button>
        <Button
          variant='gradient'
          className='w-[50%]'
          size='lg'
          onClick={() =>
            void (async () => {
              origin && (await addOrigin(origin));
              window.close();
            })()
          }
        >
          Approve
        </Button>
      </div>
    </div>
  );
};
