import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { SetStateAction, useState } from 'react';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { CopyToClipboard } from '@penumbra-zone/ui/components/ui/copy-to-clipboard';
import { FadeTransition } from '@penumbra-zone/ui/components/ui/fade-transition';
import { FileTextGradientIcon } from '../../../icons';
import { PasswordInput, SettingsHeader } from '../../../shared';
import { useStore } from '../../../state';
import { passwordSelector } from '../../../state/password';
import { walletsSelector } from '../../../state/wallets';

export const SettingsPassphrase = () => {
  const { isPassword } = useStore(passwordSelector);
  const { getSeedPhrase } = useStore(walletsSelector);

  const [password, setPassword] = useState('');
  const [enteredIncorrect, setEnteredIncorrect] = useState(false);
  const [phrase, setPhrase] = useState<string[]>([]);

  const sumbit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    void (async function () {
      if (await isPassword(password)) {
        setPhrase(await getSeedPhrase());
      } else {
        setEnteredIncorrect(true);
      }
    })();
  };

  return (
    <FadeTransition>
      <div className='flex min-h-screen w-screen flex-col gap-6'>
        <SettingsHeader title='Recovery Passphrase' />
        <div className='mx-auto size-20'>
          <FileTextGradientIcon />
        </div>
        <form
          className='flex flex-1 flex-col items-start justify-between px-[30px] pb-5'
          onSubmit={sumbit}
        >
          <div className='flex flex-col gap-3'>
            <p className='text-muted-foreground'>
              If you change browser or switch to another computer, you will need this recovery
              passphrase to access your accounts.
            </p>
            <p className='mb-3 flex items-center gap-2 text-rust'>
              <ExclamationTriangleIcon /> Don’t share this phrase with anyone
            </p>
            {!phrase.length ? (
              <PasswordInput
                passwordValue={password}
                label={
                  <p className='font-headline font-semibold text-muted-foreground'>Password</p>
                }
                onChange={(e: { target: { value: SetStateAction<string>; }; }) => {
                  setPassword(e.target.value);
                  setEnteredIncorrect(false);
                }}
                validations={[
                  {
                    type: 'error',
                    issue: 'wrong password',
                    checkFn: (txt: string) => Boolean(txt) && enteredIncorrect,
                  },
                ]}
              />
            ) : (
              <div className='flex flex-col gap-2'>
                <p className='font-headline text-base font-semibold'>Recovery secret phrase</p>
                <div className='mb-[6px] grid grid-cols-3 gap-4 rounded-lg border bg-background p-5'>
                  {phrase.map((word, i) => (
                    <div className='flex' key={i}>
                      <p className='w-5 text-left text-muted-foreground'>{i + 1}.</p>
                      <p className='text-muted-foreground'>{word}</p>
                    </div>
                  ))}
                </div>
                <CopyToClipboard
                  text={phrase.join(' ')}
                  label={<span className='font-bold text-muted-foreground'>Copy to clipboard</span>}
                  className='m-auto'
                  isSuccessCopyText
                />
              </div>
            )}
          </div>
          {!phrase.length ? (
            <Button variant='gradient' size='lg' className='w-full' type='submit'>
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
