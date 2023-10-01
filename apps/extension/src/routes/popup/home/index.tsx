import { redirect } from 'react-router-dom';
import { CopyToClipboard, Progress } from 'ui';
import { localExtStorage } from '../../../storage/local';
import { sessionExtStorage } from '../../../storage/session';
import { PopupPath } from '../paths';
import { IndexHeader } from './index-header';
import { CopyIcon } from '@radix-ui/react-icons';
import { useStore } from '../../../state';
import { accountsSelector, activeAccount } from '../../../state/accounts';
import { Identicon } from 'ui/components/ui/identicon';

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
    <div className='flex flex-col items-stretch justify-start px-[30px]'>
      <IndexHeader />
      <div className='mb-[108px] flex w-full flex-col'>
        <div className='relative bottom-[-48px] right-5 -z-10 h-[170px] max-h-[170px] w-[388px] overflow-hidden'>
          <img src='/penumbra-logo.svg' className='object-cover' />
        </div>
        <div>
          <p className='mb-4 text-center font-headline text-xl font-semibold leading-[30px]'>
            {account?.label}
          </p>
          <div onClick={previous} className='select-none hover:cursor-pointer'>
            ⬅️
          </div>
          <div onClick={next} className='select-none hover:cursor-pointer'>
            ➡️️
          </div>
        </div>
        <p>index {account?.index}</p>
        <div className='flex items-center justify-between gap-1 break-all rounded-lg border bg-background px-3 py-4'>
          <div className='flex items-center gap-[6px]'>
            <Identicon name={account?.address ?? ''} className='h-6 w-6 rounded-full' />
            <p className='text-center text-[12px] font-bold leading-[18px] text-muted-foreground'>
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
      <div className='flex flex-col items-center gap-1 font-headline text-xl font-semibold leading-[30px] text-sand'>
        <p>Syncing blocks...</p>
        <Progress value={73} />
        <p>10982/121312</p>
      </div>
    </div>
  );
};
