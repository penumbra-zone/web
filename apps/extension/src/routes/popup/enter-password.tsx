import { useStore } from '../../state';
import { useState } from 'react';
import { PopupPath } from './paths';
import { usePopupNav } from '../../utils/navigate';
import { passwordSelector } from '../../state/password';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  InputProps,
} from 'ui/components';
import { FadeTransition, PasswordInput } from '../../components';
import { PagePath } from '../page/paths';

export const EnterPassword = () => {
  const navigate = usePopupNav();
  const { isPassword, setPassword } = useStore(passwordSelector);
  const [password, setPasswordValue] = useState('');
  const [matchError, setMatchError] = useState(true);

  const handleUnlock = () => {
    void (async function () {
      if (await isPassword(password)) {
        setPassword(password);
        navigate(PopupPath.INDEX);
      } else {
        setMatchError(false);
      }
    })();
  };

  const handleChangePassword: InputProps['onChange'] = e => {
    setPasswordValue(e.target.value);
    setMatchError(true);
  };

  const gotoRestorePage = () =>
    void (async function () {
      await chrome.tabs.create({
        url: `${chrome.runtime.getURL('page.html')}#${PagePath.FORGOT_PASSWORD}`,
      });
    })();

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
