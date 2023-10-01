import { redirect } from 'react-router-dom';
import { CopyToClipboard } from 'ui';
import { localExtStorage } from '../../../storage/local';
import { sessionExtStorage } from '../../../storage/session';
import { PopupPath } from '../paths';
import { IndexHeader } from './index-header';
import { ArrowLeftIcon, ArrowRightIcon, CopyIcon } from '@radix-ui/react-icons';
import { useStore } from '../../../state';
import { accountsSelector, activeAccount } from '../../../state/accounts';
import { Identicon } from 'ui/components/ui/identicon';
import { BlockSync } from './block-sync';

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts & password in the loader.
// Will redirect to onboarding or password check if necessary.
export const popupIndexLoader = async () => {
  const wallets = await localExtStorage.get('wallets');

  if (!wallets.length) {
    await chrome.tabs.create({ url: chrome.runtime.getURL(`page.html`) });
    window.close();
  }

  const password = await sessionExtStorage.get('passwordKey');

  if (!password) return redirect(PopupPath.LOGIN);

  return null;
};

export const PopupIndex = () => {
  const account = useStore(activeAccount);
  const { next, previous } = useStore(accountsSelector);

  return (
    <div className='relative flex h-full flex-col items-stretch justify-start bg-left-bottom px-[30px]'>
      <div className='absolute bottom-[50px] left-[-10px] -z-10 h-[715px] w-[900px] bg-logo opacity-25' />
      <IndexHeader />
      <div className='mb-[150px] flex w-full flex-col'>
        <div className='mt-24 flex justify-between'>
          {account?.index !== 0 ? (
            <ArrowLeftIcon onClick={previous} className='h-6 w-6 hover:cursor-pointer' />
          ) : (
            <div className='h-6 w-6'></div>
          )}
          <p className='mb-4 select-none text-center font-headline text-xl font-semibold leading-[30px]'>
            {account?.index !== undefined && `Account #${account.index}`}
          </p>
          <ArrowRightIcon onClick={next} className='h-6 w-6 hover:cursor-pointer' />
        </div>
        <div className='flex items-center justify-between gap-1 break-all rounded-lg border bg-background px-3 py-4'>
          <div className='flex items-center gap-[6px]'>
            <Identicon name={account?.address ?? ''} className='h-6 w-6 rounded-full' />
            <p className='select-none text-center text-[12px] font-bold leading-[18px] text-muted-foreground'>
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
