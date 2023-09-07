import { redirect } from 'react-router-dom';
import { CopyToClipboard } from 'ui/components';
import { FadeTransition, SettingsHeader } from '../../components';
import { useStore } from '../../state';
import { accountsSelector } from '../../state/accounts';
import { localExtStorage } from '../../storage/local';
import { sessionExtStorage } from '../../storage/session';
import { PopupPath } from './paths';

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
    <FadeTransition className='flex flex-col items-stretch justify-start'>
      <SettingsHeader />
      <div className='flex flex-col items-center px-7'>
        <div className='relative -bottom-20 -z-10 flex h-[142px] w-[284px] items-end justify-center rounded-t-[142px] border-[6px]  border-b-0 border-teal bg-transparent'></div>
        <h1 className='pb-4'>{all[0]?.label}</h1>
        <div className='flex items-center justify-between gap-4 break-all rounded-lg border border-[#363434] bg-background px-3 py-[18px]'>
          <p className='text-center text-sm font-bold text-foreground'>
            penumbrav2t1ruaj9ff230y0tffr7nr9y6ata6gv0fxrjs2dn5ptl86fuveuv73ql8p9n36frwcsdlgmm4x22rfa8884ek6e3yv7r9c8q4st4sfc339hym9jlfx390e54uv9fcqcnnx8frsncp
          </p>
          <CopyToClipboard
            text='penumbrav2t1ruaj9ff230y0tffr7nr9y6ata6gv0fxrjs2dn5ptl86fuveuv73ql8p9n36frwcsdlgmm4x22rfa8884ek6e3yv7r9c8q4st4sfc339hym9jlfx390e54uv9fcqcnnx8frsncp'
            childType='icon'
          />
        </div>
      </div>
    </FadeTransition>
  );
};
