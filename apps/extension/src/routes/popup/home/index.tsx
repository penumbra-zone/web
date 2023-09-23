import { redirect } from 'react-router-dom';
import { CopyToClipboard, Progress } from 'ui';
import { useStore } from '../../../state';
import { localExtStorage } from '../../../storage/local';
import { sessionExtStorage } from '../../../storage/session';
import { PopupPath } from '../paths';
import { IndexHeader } from './index-header';
import { walletsSelector } from '../../../state/wallets';
import { CopyIcon } from '@radix-ui/react-icons';

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts & password in the loader.
// Will redirect to onboarding or password check if necessary.
export const popupIndexLoader = async () => {
  const wallets = await localExtStorage.get('wallets');

  if (!wallets.length) {
    await chrome.tabs.create({ url: chrome.runtime.getURL(`page.html`) });
    window.close();
  }

  const password = await sessionExtStorage.get('hashedPassword');

  if (!password) return redirect(PopupPath.LOGIN);

  return null;
};

export const PopupIndex = () => {
  const { all } = useStore(walletsSelector);

  return (
    <div className='flex flex-col items-stretch justify-start px-[30px]'>
      <IndexHeader />
      <div className='mb-[108px] flex w-full flex-col'>
        <div className='relative bottom-[-48px] right-5 -z-10 h-[170px] max-h-[170px] w-[388px] overflow-hidden'>
          <img src='/penumbra-logo.svg' className='object-cover' />
        </div>
        <p className='mb-4 text-center font-headline text-xl font-semibold leading-[30px]'>
          {all[0]?.label}
        </p>
        <div className='flex items-center justify-between gap-1 break-all rounded-lg border bg-background px-3 py-4'>
          <div className='flex items-center gap-[6px]'>
            <img
              src='https://avatar.vercel.sh/rauchg'
              alt='icon'
              className='h-6 w-6 rounded-full'
            />
            <p className='text-center text-[12px] font-bold leading-[18px] text-muted-foreground'>
              penumbrav2t13vh0fkf3qkqjacpm59g23uf...
            </p>
          </div>
          <CopyToClipboard
            text='penumbrav2t1ruaj9ff230y0tffr7nr9y6ata6gv0fxrjs2dn5ptl86fuveuv73ql8p9n36frwcsdlgmm4x22rfa8884ek6e3yv7r9c8q4st4sfc339hym9jlfx390e54uv9fcqcnnx8frsncp'
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
