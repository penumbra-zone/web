import { redirect } from 'react-router-dom';
import { SelectAccount } from '@penumbra-zone/ui';
import { PopupPath } from '../paths';
import { IndexHeader } from './index-header';
import { useStore } from '../../../state';
import { BlockSync } from './block-sync';
import { localExtStorage, sessionExtStorage } from '@penumbra-zone/storage';
import { addrByIndexSelector } from '../../../state/wallets';

export interface PopupLoaderData {
  fullSyncHeight: number;
}

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts & password in the loader.
// Will redirect to onboarding or password check if necessary.
export const popupIndexLoader = async (): Promise<Response | PopupLoaderData> => {
  const wallets = (await localExtStorage.get('wallets')) ?? [];

  if (!wallets.length) {
    await chrome.tabs.create({ url: chrome.runtime.getURL(`page.html`) });
    window.close();
  }

  const password = await sessionExtStorage.get('passwordKey');

  if (!password) return redirect(PopupPath.LOGIN);

  const fullSyncHeight = (await localExtStorage.get('fullSyncHeight')) ?? 0;

  return { fullSyncHeight };
};

export const PopupIndex = () => {
  const getAddrByIndex = useStore(addrByIndexSelector);

  return (
    <div className='flex h-full grow flex-col items-stretch justify-start bg-logo bg-left-bottom px-[30px]'>
      <IndexHeader />
      <div className='my-32'>
        <SelectAccount getAddrByIndex={getAddrByIndex} />
      </div>
      <BlockSync />
    </div>
  );
};
