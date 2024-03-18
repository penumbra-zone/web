import { FormEvent, MouseEvent, useState } from 'react';
import { BackIcon } from '@penumbra-zone/ui/components/ui/back-icon';
import { Button } from '@penumbra-zone/ui/components/ui/button';
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
import { PasswordInput } from '../../../shared/components/password-input';

export const SetPassword = () => {
  const navigate = usePageNav();
  const finalOnboardingSave = useOnboardingSave();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const handleSubmit = (event: FormEvent | MouseEvent) => {
    event.preventDefault();

    void (async () => {
      await finalOnboardingSave(password);
      navigate(PagePath.ONBOARDING_SUCCESS);
    })();
  };

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
        <CardContent>
          <form className='mt-6 grid gap-4' onSubmit={handleSubmit}>
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
              onClick={handleSubmit}
            >
              Next
            </Button>
          </form>
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
