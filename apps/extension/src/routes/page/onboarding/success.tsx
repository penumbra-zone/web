import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CompressedVideoLogo,
  FadeTransition,
} from 'ui';

export const OnboardingSuccess = () => {
  return (
    <FadeTransition>
      <div className='absolute inset-0 flex w-screen items-center justify-center'>
        <CompressedVideoLogo noWords className='w-[calc(100%-25vw)]' />
      </div>
      <Card className='w-[608px]' gradient>
        <CardHeader className='items-start'>
          <CardTitle className='bg-text-linear bg-clip-text text-[40px] font-bold leading-9 text-transparent opacity-80'>
            Account created
          </CardTitle>
        </CardHeader>
        <CardContent className='mt-4 grid gap-2 text-base font-bold'>
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
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
