import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { Button, CopyToClipboard, FadeTransition } from '@penumbra-zone/ui';
import { PasswordInput, SettingsHeader } from '../../../shared';
import { useStore } from '../../../state';
import { passwordSelector } from '../../../state/password';
import { AccountKeyGradientIcon } from '../../../icons';
import { walletsSelector } from '../../../state/wallets';

export const SettingsSpendKey = () => {
  const { isPassword } = useStore(passwordSelector);
  const { getSpendKey } = useStore(walletsSelector);

  const [password, setPassword] = useState('');
  const [enteredIncorrect, setEnteredIncorrect] = useState(false);
  const [spendKey, setSpendKey] = useState('');

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    void (async function () {
      if (await isPassword(password)) {
        setSpendKey(await getSpendKey());
      } else {
        setEnteredIncorrect(true);
      }
    })();
  };

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-6'>
        <SettingsHeader title='Spending Key' />
        <div className='mx-auto h-20 w-20'>
          <AccountKeyGradientIcon />
        </div>
        <form
          className='flex flex-1 flex-col items-start justify-between px-[30px] pb-5'
          onSubmit={submit}
        >
          <div className='flex flex-col gap-4'>
            {!spendKey ? (
              <PasswordInput
                passwordValue={password}
                label={
                  <p className='font-headline font-semibold text-muted-foreground'>Password</p>
                }
                onChange={e => {
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
              <div className='break-all rounded-lg border bg-background px-[18px] py-[14px] text-muted-foreground'>
                {spendKey}
              </div>
            )}
            {spendKey && (
              <CopyToClipboard
                text={spendKey}
                label={<span className='font-bold text-muted-foreground'>Copy to clipboard</span>}
                className='m-auto mb-2'
                isSuccessCopyText
              />
            )}
            <p className='flex items-center gap-2 text-rust'>
              <span>
                <ExclamationTriangleIcon />
              </span>
              Warning: never reveal this key. Anyone with your keys can steal any assets held in
              your account.
            </p>
          </div>
          {!spendKey ? (
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
