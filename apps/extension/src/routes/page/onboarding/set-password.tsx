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
import { usePageNav } from '../../../utils/navigate';
import { PagePath } from '../paths';
import { useState } from 'react';
import { useOnboardingSave } from '../../../hooks/onboarding';

export const SetPassword = () => {
  const navigate = usePageNav();
  const finalOnboardingSave = useOnboardingSave();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

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
            value={password}
            label='New password'
            isHelper={Boolean(password.length) && password.length < 8}
            helper='password too short'
            onChange={({ target: { value } }) => setPassword(value)}
          />
          <PasswordInput
            value={confirmation}
            label='Confirm password'
            isHelper={Boolean(confirmation.length) && password !== confirmation}
            helper="passwords don't match"
            onChange={({ target: { value } }) => setConfirmation(value)}
          />
          <Button
            variant='gradient'
            disabled={password.length < 8 || password !== confirmation}
            onClick={() => {
              finalOnboardingSave(password);
              navigate(PagePath.ONBOARDING_SUCCESS);
            }}
          >
            Next
          </Button>
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
