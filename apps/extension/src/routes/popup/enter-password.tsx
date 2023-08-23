import { useState } from 'react';
import { Button, InputProps } from 'ui/components';
import { FadeTransition, PasswordInput } from '../../components';
import { useStore } from '../../state';
import { passwordSelector } from '../../state/password';
import { usePopupNav } from '../../utils/navigate';
import { PopupPath } from './paths';
import { PopupLayout } from './popup-layout';

export const EnterPassword = () => {
  const navigate = usePopupNav();
  const { isCorrectPassword, isUnlock, setCorrectPassword } = useStore(passwordSelector);
  const [password, setPasswordValue] = useState('');

  const handleUnlock = () => {
    void (async function () {
      if (await isUnlock(password)) {
        navigate(PopupPath.INDEX);
      }
    })();
  };

  const handleChangePassword: InputProps['onChange'] = e => {
    setPasswordValue(e.target.value);
    setCorrectPassword();
  };

  const gotoRestorePage = () =>
    void (async function () {
      await chrome.tabs.create({
        url: chrome.runtime.getURL('page.html'),
      });
    })();

  return (
    <PopupLayout>
      <FadeTransition>
        <div className='grid gap-4 p-6 text-white shadow-sm'>
          <p className='text-center text-2xl font-semibold leading-none tracking-tight'>
            Welcome back!
          </p>
          <p className='text-center text-sm text-muted-foreground'>
            A decentralized network awaits
          </p>
          <div className='grid gap-4 p-6 pt-0'>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleUnlock();
              }}
              className='grid gap-4'
            >
              <PasswordInput
                passwordValue={password}
                label='Password'
                onChange={handleChangePassword}
                validations={[
                  {
                    type: 'error',
                    error: 'wrong password',
                    checkFn: (txt: string) => Boolean(txt) && !isCorrectPassword,
                  },
                ]}
              />
              <Button
                variant='gradient'
                disabled={!isCorrectPassword}
                onClick={handleUnlock}
                type='button'
              >
                Unlock
              </Button>
            </form>
            <Button className='text-white' variant='link' onClick={gotoRestorePage}>
              Forgot Password?
            </Button>
            <p className='text-sm'>
              Need help? Contact{' '}
              <a
                className='cursor-pointer text-sm text-teal-500 hover:underline'
                target='_blank'
                href='https://discord.com/channels/824484045370818580/1077672871251415141'
              >
                Penumbra Support
              </a>
            </p>
          </div>
        </div>
      </FadeTransition>
    </PopupLayout>
  );
};
