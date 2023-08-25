import { redirect } from 'react-router-dom';
import { localExtStorage } from '../../storage/local';
import { PopupPath } from './paths';
import { sessionExtStorage } from '../../storage/session';
import { passwordSelector } from '../../state/password';
import { FadeTransition } from '../../components';
import { Button } from 'ui/components';
import { useStore } from '../../state';
import { usePopupNav } from '../../utils/navigate';
import { PopupLayout } from './popup-layout';

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

  if (!password) {
    return redirect(PopupPath.ENTER_PASSWORD);
  }
  return null;
};

export const PopupIndex = () => {
  const navigate = usePopupNav();
  const { clearSessionPassword } = useStore(passwordSelector);

  const handleLogout = () => {
    clearSessionPassword();
    navigate(PopupPath.ENTER_PASSWORD);
  };

  return (
    <PopupLayout>
      <FadeTransition>
        <div className='grid gap-4 p-6 text-white shadow-sm'>
          <p className='text-center text-2xl font-semibold leading-none tracking-tight'>
            Successful login
          </p>
          <p className=' text-center text-sm'>A You are all set!</p>
          <p className='text-center text-sm'>
            Use your account to transact, stake, swap or market make. All of it is shielded and
            private.
          </p>
          <Button
            variant='gradient'
            onClick={() => {
              window.open('https://app.testnet.penumbra.zone/', '_blank');
              window.close();
            }}
          >
            Visit testnet web app
          </Button>
          <Button variant='gradient' onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </FadeTransition>
    </PopupLayout>
  );
};
