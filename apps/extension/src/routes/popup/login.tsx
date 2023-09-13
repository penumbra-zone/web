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
        <img src='/logo.png' alt='logo' className='mx-auto my-0 h-[78px] w-[148px]' />
        <form onSubmit={handleUnlock} className='grid gap-4'>
          <PasswordInput
            passwordValue={input}
            label={
              <p className='bg-gradient-to-r from-[rgba(139,228,217,0.70)] via-[rgba(200,184,128,0.70)] to-[rgba(255,144,47,0.60)] bg-clip-text text-4xl text-transparent'>
                Enter your password
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
            className='font-body text-base_bold text-muted-foreground'
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
          <p className='text-center text-base_bold text-muted-foreground'>
            Need help? Contact{' '}
            <a
              className='cursor-pointer text-base_bold text-teal hover:underline'
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
