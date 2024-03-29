import { SelectAccount } from '@penumbra-zone/ui/components/ui/select-account';
import { IndexHeader } from './index-header';
import { useStore } from '../../../state';
import { BlockSync } from './block-sync';
import { localExtStorage } from '@penumbra-zone/storage/src/chrome/local';
import { addrByIndexSelector, getActiveWallet } from '../../../state/wallets';
import { needsLogin } from '../popup-needs';

export interface PopupLoaderData {
  fullSyncHeight: number;
}

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts & password in the loader.
// Will redirect to onboarding or password check if necessary.
export const popupIndexLoader = async (): Promise<Response | PopupLoaderData> =>
  (await needsLogin()) ?? { fullSyncHeight: await localExtStorage.get('fullSyncHeight') };

export const PopupIndex = () => {
  const activeWallet = useStore(getActiveWallet);
  const getAddrByIndex = useStore(addrByIndexSelector);

  return (
    <div className='flex h-full grow flex-col items-stretch justify-start bg-logo bg-left-bottom px-[30px]'>
      <IndexHeader />
      <div className='my-32'>
        {activeWallet && <SelectAccount getAddrByIndex={getAddrByIndex} />}
      </div>
      <BlockSync />
    </div>
  );
};
