import { CopyIcon, DownloadIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { Button, CopyToClipboard } from 'ui/components';
import { FileTextGradientIcon } from '../../../icons';
import { FadeTransition, PasswordInput, SettingsHeader } from '../../../shared';
import { useStore } from '../../../state';
import { passwordSelector } from '../../../state/password';

export const SettingsPassphrase = () => {
  const { isPassword } = useStore(passwordSelector);

  const [input, setInputValue] = useState('');
  const [enteredIncorrect, setEnteredIncorrect] = useState(false);
  const [phrase, setPhrase] = useState<string[]>([]);

  const sumbit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    void (async function () {
      if (await isPassword(input)) {
        // add logic to get seed
        setPhrase([
          'aware',
          'midnight',
          'urge',
          'hint',
          'refuse',
          'quote',
          'marriage',
          'health',
          'ugly',
          'coffee',
          'pretty',
          'occur',
        ]);
      } else {
        setEnteredIncorrect(true);
      }
    })();
  };

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Recovery Passphrase' />
        <div className='mx-auto h-20 w-20'>
          <FileTextGradientIcon />
        </div>
        <form
          className='flex flex-1 flex-col items-start justify-between px-[30px] pb-[30px]'
          onSubmit={sumbit}
        >
          <div className='flex flex-col gap-4'>
            <p className='text-base-bold text-muted-foreground'>
              If you change browser or switch to another computer, you will need this recovery
              passphrase to access your accounts.
            </p>
            <p className='mb-2 flex items-center gap-2 text-base-bold text-rust'>
              <ExclamationTriangleIcon /> Don’t share this phrase with anyone
            </p>
            {!phrase.length ? (
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
              <div className='flex flex-col gap-2'>
                <p className='font-headline text-xl-semibold'>Recovery secret phrase</p>
                <div className='mb-[6px] grid grid-cols-3 gap-4 rounded-lg border border-border bg-background p-5'>
                  {phrase.map((word, i) => (
                    <div className='flex' key={i}>
                      <p className='w-5 text-left text-base-bold text-muted-foreground'>{i + 1}.</p>
                      <p className='text-base-bold text-muted-foreground'>{word}</p>
                    </div>
                  ))}
                </div>
                <div className='flex gap-[18px]'>
                  <CopyToClipboard
                    className='h-9 w-[50%] rounded-lg bg-teal font-headline text-base-semibold text-muted opacity-80 hover:no-underline hover:opacity-50'
                    label={
                      <p className='flex items-center gap-2 text-base-semibold'>
                        <CopyIcon /> Copy
                      </p>
                    }
                    text={phrase.join(' ')}
                  />
                  <Button className='h-9 w-[50%] bg-sand opacity-80 hover:opacity-50'>
                    <p className='flex items-center gap-2 text-base-semibold'>
                      <DownloadIcon /> CSV
                    </p>
                  </Button>
                </div>
              </div>
            )}
          </div>
          {!phrase.length ? (
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
