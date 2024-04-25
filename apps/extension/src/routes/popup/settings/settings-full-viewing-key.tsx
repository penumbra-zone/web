import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { CopyToClipboard } from '@penumbra-zone/ui/components/ui/copy-to-clipboard';
import { PasswordInput } from '../../../shared/components/password-input';
import { useStore } from '../../../state';
import { passwordSelector } from '../../../state/password';
import { KeyGradientIcon } from '../../../icons/key-gradient';
import { walletsSelector } from '../../../state/wallets';
import { bech32mFullViewingKey } from '@penumbra-zone/bech32m/penumbrafullviewingkey';
import { SettingsScreen } from './settings-screen';

export const SettingsFullViewingKey = () => {
  const { isPassword } = useStore(passwordSelector);
  const { getFullViewingKey } = useStore(walletsSelector);

  const [password, setPassword] = useState('');
  const [enteredIncorrect, setEnteredIncorrect] = useState(false);
  const [fullViewingKey, setFullViewingKey] = useState<string>();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    void (async function () {
      if (await isPassword(password)) {
        setFullViewingKey(bech32mFullViewingKey(await getFullViewingKey()));
      } else {
        setEnteredIncorrect(true);
      }
    })();
  };

  return (
    <SettingsScreen title='Full viewing key' IconComponent={KeyGradientIcon}>
      <form className='flex flex-1 flex-col items-start justify-between' onSubmit={submit}>
        <div className='flex flex-col gap-4'>
          {!fullViewingKey ? (
            <PasswordInput
              passwordValue={password}
              label={<p className='font-headline font-semibold text-muted-foreground'>Password</p>}
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
              {fullViewingKey}
            </div>
          )}
          {fullViewingKey && (
            <CopyToClipboard
              text={fullViewingKey}
              label={<span className='font-bold text-muted-foreground'>Copy to clipboard</span>}
              className='m-auto mb-2'
              isSuccessCopyText
            />
          )}
          <p className='flex items-center gap-2 text-rust'>
            <span>
              <ExclamationTriangleIcon />
            </span>
            Warning: never reveal this key. Anyone with your keys can steal any assets held in your
            account.
          </p>
        </div>
        {!fullViewingKey ? (
          <Button variant='gradient' size='lg' className='w-full' type='submit'>
            Confirm
          </Button>
        ) : (
          <></>
        )}
      </form>
    </SettingsScreen>
  );
};
