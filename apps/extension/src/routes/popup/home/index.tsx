import { redirect } from 'react-router-dom';
import { CopyToClipboard, Progress } from 'ui/components';
import { localExtStorage } from '../../../storage/local';
import { sessionExtStorage } from '../../../storage/session';
import { PopupPath } from '../paths';
import { useStore } from '../../../state';
import { accountsSelector } from '../../../state/accounts';
import { FadeTransition } from '../../../shared';
import { SettingsHeader } from './settings-header';

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts & password in the loader.
// Will redirect to onboarding or password check if necessary.
export const popupIndexLoader = async () => {
  const accounts = await localExtStorage.get('accounts');

  if (!accounts.length) {
    await chrome.tabs.create({ url: chrome.runtime.getURL(`page.html`) });
    window.close();
  }

  const password = await sessionExtStorage.get('hashedPassword');

  if (!password) return redirect(PopupPath.LOGIN);

  return null;
};

export const PopupIndex = () => {
  const { all } = useStore(accountsSelector);
  return (
    <FadeTransition className='flex flex-col items-stretch justify-start px-7'>
      <SettingsHeader />
      <div className='w-full flex flex-col mb-[108px]'>
        <div className='max-h-[170px] h-[170px] w-[388px] overflow-hidden relative -bottom-[48px] -z-10 right-5'>
          <img src='/penumbra-logo.png' className='object-cover' />
        </div>
        <p className='text-3xl font-headline mb-4 text-center'>{all[0]?.label}</p>
        <div className='flex items-center justify-between gap-2 break-all rounded-lg border border-border bg-background px-3 py-4'>
          <img src='https://avatar.vercel.sh/rauchg' alt='icon' className='w-6 h-6 rounded-full' />
          <p className='text-center text-base_bold text-muted-foreground'>
            penumbrav2t13vh0fkf3qkqjacpm59g23uf...
          </p>
          <CopyToClipboard
            text='penumbrav2t1ruaj9ff230y0tffr7nr9y6ata6gv0fxrjs2dn5ptl86fuveuv73ql8p9n36frwcsdlgmm4x22rfa8884ek6e3yv7r9c8q4st4sfc339hym9jlfx390e54uv9fcqcnnx8frsncp'
            childType='icon'
          />
        </div>
      </div>
      <div className='flex flex-col items-center gap-1'>
        <p className='text-3xl font-headline text-sand'>Syncing blocks...</p>
        <p className='text-[22px] font-medium text-muted-foreground leading-8 font-headline'>
          10982/121312
        </p>
        <Progress value={73} />
      </div>
    </FadeTransition>
  );
};
