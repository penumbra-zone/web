import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CompressedVideoLogo,
} from 'ui/components';
import { FadeTransition } from '../../../components/fade-transition';
import { useStore } from '../../../state';
import { passwordSelector } from '../../../state/password';

export const OnboardingSuccess = () => {
  const { clearSessionPassword } = useStore(passwordSelector);
  return (
    <FadeTransition>
      <div className='absolute inset-0 flex w-screen items-center justify-center'>
        <CompressedVideoLogo noWords className='w-[850px]' />
      </div>
      <Card className='w-[650px] p-6' gradient>
        <CardHeader>
          <CardTitle className='bg-gradient-to-r from-teal-400 via-neutral-300 to-orange-400 bg-clip-text text-6xl text-transparent opacity-80'>
            Account created
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
