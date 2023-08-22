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
  InputProps,
} from 'ui/components';
import { usePageNav } from '../../utils/navigate';
import { FadeTransition, PasswordInput } from '../../components';
import { passwordSelector } from '../../state/password';
import { useStore } from '../../state';
import { useState } from 'react';
import { sessionExtStorage } from '../../storage/session';

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts in the loader.
// Will redirect to onboarding if necessary.
export const pageIndexLoader = async () => {
  const accounts = await localExtStorage.get('accounts');
  if (!accounts.length) redirect(PagePath.WELCOME);

  const password = await sessionExtStorage.get('hashedPassword');

  return password ? redirect(PagePath.ONBOARDING_SUCCESS) : null;
};

export const PageIndex = () => {
  const navigate = usePageNav();
  const { isPassword, setPassword } = useStore(passwordSelector);
  const [password, setPasswordValue] = useState('');
  const [matchError, setMatchError] = useState(true);

  const handleUnlock = () => {
    void (async function () {
      if (await isPassword(password)) {
        setPassword(password);
        navigate(PagePath.ONBOARDING_SUCCESS);
      } else {
        setMatchError(false);
      }
    })();
  };

  const handleChangePassword: InputProps['onChange'] = e => {
    setPasswordValue(e.target.value);
    setMatchError(true);
  };

  const gotoRestorePage = () => navigate(PagePath.FORGOT_PASSWORD);

  return (
    <FadeTransition>
      <Card className='w-[300px] p-2' gradient>
        <CardHeader className='items-center'>
          <CardTitle>Welcome back!</CardTitle>
          <CardDescription className='text-center'>A decentralized network awaits</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleUnlock();
            }}
            className='grid gap-4'
          >
            <PasswordInput
              value={password}
              label='Password'
              isHelper={!matchError}
              helper='wrong password'
              onChange={handleChangePassword}
            />
            <Button variant='gradient' disabled={!matchError} onClick={handleUnlock} type='button'>
              Unlock
            </Button>
          </form>
          <Button className='text-white' variant='link' onClick={gotoRestorePage}>
            Forgot Password?
          </Button>
          <p className='text-sm'>
            Need help? Contact{' '}
            <a
              className='cursor-pointer text-sm text-green-600 hover:underline'
              target='_blank'
              href='https://guide.penumbra.zone/main/extension.html'
            >
              Penumbra Support
            </a>
          </p>
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
