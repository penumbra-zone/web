import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { Button, CopyToClipboard } from 'ui/components';
import { FadeTransition, PasswordInput, SettingsHeader } from '../../../shared';
import { useStore } from '../../../state';
import { passwordSelector } from '../../../state/password';
import { KeyGradientIcon } from '../../../icons';

export const SettingsFullViewingKey = () => {
  const { isPassword } = useStore(passwordSelector);

  const [input, setInputValue] = useState('');
  const [enteredIncorrect, setEnteredIncorrect] = useState(false);
  const [fvk, setFVK] = useState('');

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    void (async function () {
      if (await isPassword(input)) {
        // add logic to get fvk
        setFVK(
          'penumbrafullviewingkey1wek2qjnzraq4qqjs9g7t8xu06c7affzntsl37pgcnhrq7dd8fuydgc9k53j64hfyfjrftkwmnjlhyjr6pdm22dkj25a8j49t00gp2qce0cteq',
        );
      } else {
        setEnteredIncorrect(true);
      }
    })();
  };

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Full Viewing Key' />
        <div className='mx-auto h-20 w-20'>
          <KeyGradientIcon />
        </div>
        <form
          className='flex flex-1 flex-col items-start justify-between px-[30px] pb-[30px]'
          onSubmit={submit}
        >
          <div className='flex flex-col gap-4'>
            {!fvk ? (
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
              <div className='break-all rounded-lg border bg-background p-4 text-base-bold text-muted-foreground'>
                {fvk}
              </div>
            )}
            {fvk && (
              <CopyToClipboard
                text={fvk}
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
          {!fvk ? (
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
