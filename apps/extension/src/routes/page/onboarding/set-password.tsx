import {
  BackIcon,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from 'ui/components';
import { FadeTransition } from '../../../components/fade-transition';
import { usePageNav } from '../../../utils/navigate';
import { PagePath } from '../paths';
import { useState } from 'react';
import { useOnboardingSave } from '../../../hooks/onboarding';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';

export const SetPassword = () => {
  const navigate = usePageNav();
  const finalOnboardingSave = useOnboardingSave();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [reveal, setReveal] = useState(false);

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
            <div className='relative w-full'>
              <div className='absolute inset-y-0 right-4 flex cursor-pointer items-center'>
                {reveal ? (
                  <EyeOpenIcon onClick={() => setReveal(false)} />
                ) : (
                  <EyeClosedIcon onClick={() => setReveal(true)} className='text-gray-500' />
                )}
              </div>
              <Input
                type={reveal ? 'text' : 'password'}
                variant={!password.length ? 'default' : password.length >= 8 ? 'success' : 'warn'}
                value={password}
                onChange={({ target: { value } }) => setPassword(value)}
              />
            </div>
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
