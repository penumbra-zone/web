import { redirect } from 'react-router-dom';
import { SelectAccount } from '@penumbra-zone/ui';
import { PopupPath } from '../paths';
import { IndexHeader } from './index-header';
import { useStore } from '../../../state';
import { accountsSelector, selectedAccount } from '../../../state/accounts';
import { BlockSync } from './block-sync';
import { localExtStorage, sessionExtStorage } from '@penumbra-zone/storage';

export interface PopupLoaderData {
  lastBlockSynced: number;
}

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts & password in the loader.
// Will redirect to onboarding or password check if necessary.
export const popupIndexLoader = async (): Promise<Response | PopupLoaderData> => {
  const wallets = await localExtStorage.get('wallets');

  if (!wallets.length) {
    await chrome.tabs.create({ url: chrome.runtime.getURL(`page.html`) });
    window.close();
  }

  const password = await sessionExtStorage.get('passwordKey');

  if (!password) return redirect(PopupPath.LOGIN);

  const lastBlockSynced = await localExtStorage.get('lastBlockSynced');

  return { lastBlockSynced };
};

export const PopupIndex = () => {
  const account = useStore(selectedAccount);
  const { ephemeral, next, previous, setIndex, setEphemeral } = useStore(accountsSelector);

  return (
    <div className='relative flex h-full flex-col items-stretch justify-start bg-left-bottom px-[30px]'>
      <div className='absolute bottom-[50px] left-[-10px] -z-10 h-[715px] w-[900px] overflow-hidden bg-logo opacity-10' />
      <IndexHeader />
      <div className='my-32'>
        {account && (
          <SelectAccount
            previous={previous}
            next={next}
            setIndex={setIndex}
            account={account}
            ephemeral={ephemeral}
            setEphemeral={setEphemeral}
          />
        )}
      </div>
      <BlockSync />
    </div>
  );
};
