import { redirect } from 'react-router-dom';
import { CopyToClipboard, Identicon, SelectAccount } from '@penumbra-zone/ui';
import { PopupPath } from '../paths';
import { IndexHeader } from './index-header';
import { CopyIcon } from '@radix-ui/react-icons';
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
  const { next, previous, setIndex } = useStore(accountsSelector);

  return (
    <div className='relative flex h-full flex-col items-stretch justify-start bg-left-bottom px-[30px]'>
      <div className='absolute bottom-[50px] left-[-10px] -z-10 h-[715px] w-[900px] overflow-hidden bg-logo opacity-10' />
      <IndexHeader />
      <div className='my-32 flex w-full flex-col'>
        <SelectAccount previous={previous} next={next} setIndex={setIndex} index={account?.index} />
        <div className='mt-4 flex items-center justify-between gap-1 break-all rounded-lg border bg-background px-3 py-4'>
          <div className='flex items-center gap-[6px]'>
            <Identicon name={account?.address ?? ''} className='h-6 w-6 rounded-full' />
            <p className='select-none text-center font-mono text-[12px] leading-[18px] text-muted-foreground'>
              {account?.preview}
            </p>
          </div>
          <CopyToClipboard
            text={account?.address ?? ''}
            label={
              <div>
                <CopyIcon className='h-4 w-4 text-muted-foreground hover:opacity-50' />
              </div>
            }
            className='w-4'
          />
        </div>
      </div>
      <BlockSync />
    </div>
  );
};
