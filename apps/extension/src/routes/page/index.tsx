import { redirect } from 'react-router-dom';
import { PagePath } from './paths';
import { localExtStorage } from '../../storage/local';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CompressedVideoLogo,
} from 'ui';
import { FadeTransition } from '../../shared';

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts in the loader.
// Will redirect to onboarding if necessary.
export const pageIndexLoader = async () => {
  const wallets = await localExtStorage.get('wallets');

  if (!wallets.length) return redirect(PagePath.WELCOME);

  return null;
};

export const PageIndex = () => {
  return (
    <FadeTransition>
      <div className='absolute inset-0 flex w-screen items-center justify-center'>
        <CompressedVideoLogo noWords className='w-[850px]' />
      </div>
      <Card className='w-[650px] p-6' gradient>
        <CardHeader>
          <CardTitle className='bg-gradient-to-r from-teal-400 via-neutral-300 to-orange-400 bg-clip-text text-6xl text-transparent opacity-80'>
            Successful login
          </CardTitle>
          <CardDescription>
            Use your account to transact, stake, swap or market make. All of it is shielded and
            private.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <Button
            variant='gradient'
            onClick={() => {
              window.open('https://app.testnet.penumbra.zone/', '_blank');
              window.close();
            }}
          >
            Visit testnet web app
          </Button>
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
