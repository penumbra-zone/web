import { useEffect, useState } from 'react';
import {
  BackIcon,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/components';
import { FadeTransition, PasswordInput } from '../../../components';
import { useOnboardingSave } from '../../../hooks/onboarding';
import { usePageNav } from '../../../utils/navigate';
import { PagePath } from '../paths';
import { useStore } from '../../../state';
import { passwordSelector } from '../../../state/password';

export const SetPassword = () => {
  const navigate = usePageNav();
  const { hashedPassword } = useStore(passwordSelector);
  const finalOnboardingSave = useOnboardingSave();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  console.log(window.location.hash);

  useEffect(() => {
    // redirect to main route after login from other tabs or popup, needed to clean up url
    if (hashedPassword) window.location.replace(chrome.runtime.getURL('page.html'));
  }, [hashedPassword]);

  return (
    <FadeTransition>
      <BackIcon className='float-left' onClick={() => navigate(-1)} />
      <Card className='w-[500px] p-6' gradient>
        <CardHeader className='items-center'>
          <CardTitle>Create a password</CardTitle>
          <CardDescription className='text-center'>
            We will use this password to encrypt your data and you'll need it to unlock your wallet.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <PasswordInput
            passwordValue={password}
            label='New password'
            onChange={({ target: { value } }) => setPassword(value)}
            validations={[
              {
                type: 'warn',
                error: 'password too short',
                checkFn: (txt: string) => Boolean(txt.length) && txt.length < 8,
              },
            ]}
          />
          <PasswordInput
            passwordValue={confirmation}
            label='Confirm password'
            onChange={({ target: { value } }) => setConfirmation(value)}
            validations={[
              {
                type: 'warn',
                error: "passwords don't match",
                checkFn: (txt: string) => Boolean(txt.length) && password !== txt,
              },
            ]}
          />
          <Button
            variant='gradient'
            disabled={password.length < 8 || password !== confirmation}
            onClick={() => {
              finalOnboardingSave(password);
              navigate(PagePath.INDEX);
            }}
          >
            Next
          </Button>
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
