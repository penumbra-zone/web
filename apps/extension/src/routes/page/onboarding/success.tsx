import { Button } from '@penumbra-zone/ui/components/ui/button';
import { SplashPage } from '@penumbra-zone/ui/components/ui/splash-page';
import { useStore } from '../../../state';
import { getDefaultFrontend } from '../../../state/default-frontend';

export const OnboardingSuccess = () => {
  const defaultFrontendUrl = useStore(getDefaultFrontend);

  return (
    <SplashPage title='Account created'>
      <div className='grid gap-2 text-base font-bold'>
        <p>You are all set!</p>
        <p>
          Use your account to transact, stake, swap or market make. All of it is shielded and
          private.
        </p>
        <Button
          variant='gradient'
          onClick={() => {
            window.open(defaultFrontendUrl, '_blank');
            window.close();
          }}
          className='mt-4'
        >
          Visit testnet web app
        </Button>
      </div>
    </SplashPage>
  );
};
