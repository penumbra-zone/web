import { redirect } from 'react-router-dom';
import { PagePath } from './paths';
import { SplashPage } from '@penumbra-zone/ui/components/ui/splash-page';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { localExtStorage } from '@penumbra-zone/storage/chrome/local';
import { useStore } from '../../state';
import { getDefaultFrontend } from '../../state/default-frontend';

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts in the loader.
// Will redirect to onboarding if necessary.
export const pageIndexLoader = async () => {
  const wallets = await localExtStorage.get('wallets');

  if (!wallets.length) return redirect(PagePath.WELCOME);

  return null;
};

export const PageIndex = () => {
  const defaultFrontendUrl = useStore(getDefaultFrontend);

  return (
    <SplashPage
      title='Successful login'
      description='Use your account to transact, stake, swap or market make.'
    >
      <Button
        variant='gradient'
        className='w-full'
        onClick={() => {
          window.open(defaultFrontendUrl, '_blank');
          window.close();
        }}
      >
        Visit testnet web app
      </Button>
    </SplashPage>
  );
};
