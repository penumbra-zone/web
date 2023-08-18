import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@ui/components';
import { FadeTransition } from '../../../components/fade-transition';
import { BackIcon } from '@ui/components/ui/back-icon';
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
          <div className='flex flex-col items-center justify-center gap-2'>
            <div className='flex gap-2 self-start'>
              <div>New password</div>
              <div className='italic text-yellow-300'>
                {Boolean(password.length) && password.length < 8 && 'password too short'}
              </div>
            </div>
            <Input
              type='password'
              variant={!password.length ? 'default' : password.length >= 8 ? 'success' : 'warn'}
              value={password}
              onChange={({ target: { value } }) => setPassword(value)}
            />
          </div>
          <div className='flex flex-col items-center justify-center gap-2'>
            <div className='flex gap-2 self-start'>
              <div>Confirm password</div>
              <div className='italic text-yellow-300'>
                {Boolean(confirmation.length) &&
                  password !== confirmation &&
                  "passwords don't match"}
              </div>
            </div>
            <Input
              type='password'
              variant={
                !confirmation.length ? 'default' : password === confirmation ? 'success' : 'warn'
              }
              value={confirmation}
              onChange={({ target: { value } }) => setConfirmation(value)}
            />
          </div>
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
