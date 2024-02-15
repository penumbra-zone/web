import { Button, SplashPage } from '@penumbra-zone/ui';

export const OnboardingSuccess = () => {
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
            window.open('https://app.testnet.penumbra.zone/', '_blank');
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
