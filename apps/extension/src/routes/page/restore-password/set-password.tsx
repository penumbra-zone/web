import { useState } from 'react';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { BackIcon } from '@penumbra-zone/ui/components/ui/back-icon';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@penumbra-zone/ui/components/ui/card';
import { FadeTransition } from '@penumbra-zone/ui/components/ui/fade-transition';
import { useOnboardingSave } from '../../../hooks/onboarding';
import { usePageNav } from '../../../utils/navigate';
import { PagePath } from '../paths';
import { PasswordInput } from '../../../shared';

export const SetPassword = () => {
  const navigate = usePageNav();
  const finalOnboardingSave = useOnboardingSave();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  return (
    <FadeTransition>
      <BackIcon className='float-left mb-4' onClick={() => navigate(-1)} />
      <Card className='w-[400px]' gradient>
        <CardHeader className='items-center'>
          <CardTitle>Create a password</CardTitle>
          <CardDescription className='text-center'>
            We will use this password to encrypt your data and you&apos;ll need it to unlock your
            wallet.
          </CardDescription>
        </CardHeader>
        <CardContent className='mt-6 grid gap-4'>
          <PasswordInput
            passwordValue={password}
            label='New password'
            onChange={({ target: { value } }) => setPassword(value)}
          />
          <PasswordInput
            passwordValue={confirmation}
            label='Confirm password'
            onChange={({ target: { value } }) => setConfirmation(value)}
            validations={[
              {
                type: 'warn',
                issue: "passwords don't match",
                checkFn: (txt: string) => password !== txt,
              },
            ]}
          />
          <Button
            variant='gradient'
            className='mt-2'
            disabled={password !== confirmation}
            onClick={() => {
              void (async function () {
                await finalOnboardingSave(password);
                navigate(PagePath.ONBOARDING_SUCCESS);
              })();
            }}
          >
            Next
          </Button>
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
