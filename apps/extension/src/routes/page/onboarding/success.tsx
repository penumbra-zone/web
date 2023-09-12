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
          <CardTitle className='bg-gradient-to-r from-teal-700 via-rust-700 to-orange-400 bg-clip-text text-4xl text-transparent opacity-80 text-center'>
            Account created
          </CardTitle>
        </CardHeader>
        <CardContent className='grid mt-2 gap-1 lg_bold'>
          <p className='text-center'>You are all set!</p>
          <p className='text-muted-foreground text-center'>
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
