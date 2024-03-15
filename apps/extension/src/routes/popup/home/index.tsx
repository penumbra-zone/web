import { SelectAccount } from '@penumbra-zone/ui';
import { IndexHeader } from './index-header';
import { useStore } from '../../../state';
import { BlockSync } from './block-sync';
import { localExtStorage } from '@penumbra-zone/storage';
import { addrByIndexSelector } from '../../../state/wallets';
import { needsLogin } from '../popup-needs';
import { PopupPath } from '../paths';

export interface PopupLoaderData {
  fullSyncHeight: number;
}

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts & password in the loader.
// Will redirect to onboarding or password check if necessary.
export const popupIndexLoader = async (): Promise<Response | PopupLoaderData> => {
  // Redirect if logged out
  const loggedOut = await needsLogin(PopupPath.INDEX);
  if (loggedOut) return loggedOut;

  // If logged in, query for page data
  return {
    fullSyncHeight: await localExtStorage.get('fullSyncHeight'),
  };
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
