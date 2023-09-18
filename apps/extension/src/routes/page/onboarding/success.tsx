import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CompressedVideoLogo,
} from 'ui/components';
import { FadeTransition } from '../../../shared';

export const OnboardingSuccess = () => {
  return (
    <FadeTransition>
      <div className='absolute inset-0 flex w-screen items-center justify-center'>
        <CompressedVideoLogo noWords className='w-[850px]' />
      </div>
      <Card className='w-[400px]' gradient>
        <CardHeader>
          <CardTitle className='bg-gradient-to-r from-teal-700 via-[rgba(200,184,128,0.70)] to-orange-400 bg-clip-text text-center text-4xl text-transparent opacity-80'>
            Account created
          </CardTitle>
        </CardHeader>
        <CardContent className='mt-2 grid gap-1 text-lg-bold'>
          <p className='text-center'>You are all set!</p>
          <p className='text-center text-muted-foreground'>
            Use your account to transact, stake, swap or market make. All of it is shielded and
            private.
          </p>
          <Button
            variant='gradient'
            onClick={() => {
              window.open('https://app.testnet.penumbra.zone/', '_blank');
              window.close();
            }}
            className='mt-6'
          >
            Visit testnet web app
          </Button>
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
