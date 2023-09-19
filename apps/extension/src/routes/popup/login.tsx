import { Button, InputProps } from 'ui/components';
import { PagePath } from '../page/paths';
import { FadeTransition, PasswordInput } from '../../shared';
import { usePopupNav } from '../../utils/navigate';
import { useStore } from '../../state';
import { passwordSelector } from '../../state/password';
import { useState } from 'react';
import { PopupPath } from './paths';

export const Login = () => {
  const navigate = usePopupNav();

  const { setPassword, isPassword } = useStore(passwordSelector);
  const [input, setInputValue] = useState('');
  const [enteredIncorrect, setEnteredIncorrect] = useState(false);

  const handleUnlock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    void (async function () {
      if (await isPassword(input)) {
        setPassword(input); // saves to session state
        navigate(PopupPath.INDEX);
      } else {
        setEnteredIncorrect(true);
      }
    })();
  };

  const handleChangePassword: InputProps['onChange'] = e => {
    setInputValue(e.target.value);
    setEnteredIncorrect(false);
  };

  return (
    <FadeTransition className='flex flex-col items-stretch justify-start'>
      <div className='flex h-screen flex-col justify-between p-[30px] pt-10 '>
        <div className='mx-auto my-0 h-[100px] w-[200px]'>
        <img src='/logo.svg' alt='logo' className='object-fit' />
        </div>
        <form onSubmit={handleUnlock} className='grid gap-4'>
          <PasswordInput
            passwordValue={input}
            label={
              <p className='bg-gradient-to-r from-teal-700 via-sand-700 to-rust-600 bg-clip-text text-4xl text-transparent'>
                Enter password
              </p>
            }
            onChange={handleChangePassword}
            validations={[
              {
                type: 'error',
                error: 'wrong password',
                checkFn: (txt: string) => Boolean(txt) && enteredIncorrect,
              },
            ]}
          />
          <Button variant='gradient' disabled={!input || enteredIncorrect} type='submit'>
            Unlock
          </Button>
        </form>
        <div className='flex flex-col gap-2'>
          <Button
            className='font-body text-base-bold text-muted-foreground'
            variant='link'
            onClick={() =>
              void (async function () {
                await chrome.tabs.create({
                  url: `${chrome.runtime.getURL('page.html')}#${PagePath.RESTORE_PASSWORD}`,
                });
              })()
            }
          >
            Forgot Password?
          </Button>
          <p className='text-center text-base-bold text-muted-foreground'>
            Need help? Contact{' '}
            <a
              className='cursor-pointer text-base-bold text-teal hover:underline'
              target='_blank'
              href='https://discord.com/channels/824484045370818580/1077672871251415141'
            >
              Penumbra Support
            </a>
          </p>
        </div>
      </div>
    </FadeTransition>
  );
};
