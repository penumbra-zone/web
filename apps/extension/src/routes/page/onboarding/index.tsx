import { Card } from '@ui/components';
import { Logo } from '@ui/components/ui/logo';
import { Outlet } from 'react-router-dom';

export const Onboarding = () => {
  return (
    <div className='flex min-h-[100vh] w-[100%] flex-col items-center justify-center'>
      <Logo className='mb-12' />
      <Card className='w-[450px] p-6'>
        <Outlet />
      </Card>
    </div>
  );
};
