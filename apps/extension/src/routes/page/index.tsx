import { redirect } from 'react-router-dom';
import { PagePath } from './paths';
import { localExtStorage } from '../../storage/local';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from 'ui/components';
import { usePageNav } from '../../utils/navigate';
import { FadeTransition } from '../../components';
import { useStore } from '../../state';
import { passwordSelector } from '../../state/password';

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts in the loader.
// Will redirect to onboarding if necessary.
export const pageIndexLoader = async () => {
  const accounts = await localExtStorage.get('accounts');
  return !accounts.length ? redirect(PagePath.WELCOME) : null;
};

export const PageIndex = () => {
  const navigate = usePageNav();

  const { clearSessionPassword } = useStore(passwordSelector);

  const handleLogout = () => {
    clearSessionPassword();
    navigate(PagePath.LOGIN);
  };

  return (
    <FadeTransition>
      <Card className='w-[500px] p-6' gradient>
        <CardHeader className='items-center'>
          <CardTitle> Successfully login</CardTitle>
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
          <Button variant='gradient' onClick={handleLogout}>
            Logout
          </Button>
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
