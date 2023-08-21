import { redirect } from 'react-router-dom';
import { localExtStorage } from '../../storage/local';
import { PopupPath } from './paths';
import { sessionExtStorage } from '../../storage/session';
import { passwordSelector } from '../../state/password';
import { FadeTransition } from '../../components';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CompressedVideoLogo,
} from 'ui/components';
import { useStore } from '../../state';
import { useEffect } from 'react';
import { usePopupNav } from '../../utils/navigate';

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
  const { clearSessionPassword, hashedPassword } = useStore(passwordSelector);

  useEffect(() => {
    if (!hashedPassword) navigate(PopupPath.ENTER_PASSWORD);
  }, [hashedPassword]);

  return (
    <FadeTransition>
      <div className='inset-0 flex w-screen flex-col items-center justify-between'>
        <CompressedVideoLogo noWords className='w-[300px]' />
      </div>
      <Card className='w-[300] p-6' gradient>
        <CardHeader>
          <CardTitle className='bg-gradient-to-r from-teal-400 via-neutral-300 to-orange-400 bg-clip-text text-xl text-transparent opacity-80'>
            Successfull login
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <p>You are all set!</p>
          <p>
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
          <Button variant='gradient' onClick={clearSessionPassword}>
            Logout
          </Button>
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
