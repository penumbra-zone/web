import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { Button, CopyToClipboard } from 'ui/components';
import { FadeTransition, PasswordInput, SettingsHeader } from '../../../../shared';
import { useStore } from '../../../../state';
import { passwordSelector } from '../../../../state/password';
import { AccountKeyIcon } from './icon';

export const SettingsSpendKey = () => {
  const { isPassword } = useStore(passwordSelector);

  const [input, setInputValue] = useState('');
  const [enteredIncorrect, setEnteredIncorrect] = useState(false);
  const [sk, setSK] = useState('');

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    void (async function () {
      if (await isPassword(input)) {
        // add logic to get sk
        setSK('penumbraspendkey1cl9w3jkauut4fj42wu5ypc5yzgwd4y3ge6yrn6lfvp625yf0sezsl58vlx');
      } else {
        setEnteredIncorrect(true);
      }
    })();
  };

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Spending Key' />
        <div className='mx-auto h-[60px] w-[60px]'>
          <AccountKeyIcon />
        </div>
        <form
          className='flex flex-1 flex-col items-start justify-between px-[30px] pb-[30px]'
          onSubmit={submit}
        >
          <div className='flex flex-col gap-4'>
            {!sk ? (
              <PasswordInput
                passwordValue={input}
                label={
                  <p className='font-headline text-xl-semibold text-muted-foreground'>Password</p>
                }
                onChange={e => {
                  setInputValue(e.target.value);
                  setEnteredIncorrect(false);
                }}
                validations={[
                  {
                    type: 'error',
                    error: 'wrong password',
                    checkFn: (txt: string) => Boolean(txt) && enteredIncorrect,
                  },
                ]}
              />
            ) : (
              <div className='break-all rounded-lg border border-border bg-background p-4 text-base-bold text-muted-foreground'>
                {sk}
              </div>
            )}
            {sk && (
              <CopyToClipboard
                text={sk}
                label={
                  <p className='font-headline text-base-bold text-muted-foreground'>
                    Copy to clipboard
                  </p>
                }
                className='m-auto mb-2 w-48'
                isSuccessCopyText
              />
            )}
            <p className='mb-2 flex items-center gap-2 text-base-bold text-rust'>
              <span>
                <ExclamationTriangleIcon />
              </span>
              Warning: never reveal this key. Anyone with your keys can steal any assets held in
              your account.
            </p>
          </div>
          {!sk ? (
            <Button variant='gradient' className='h-11 w-full' type='submit'>
              Confirm
            </Button>
          ) : (
            <></>
          )}
        </form>
      </div>
    </FadeTransition>
  );
};
