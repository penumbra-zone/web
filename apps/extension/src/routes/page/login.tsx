import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from 'ui/components';
import { FadeTransition, LoginForm } from '../../components';
import { usePageNav } from '../../utils/navigate';
import { PagePath } from './paths';

export const Login = () => {
  const navigate = usePageNav();

  const gotoRestorePage = () => navigate(PagePath.RESTORE_PASSWORD);

  return (
    <FadeTransition>
      <Card className='w-[500px] p-6' gradient>
        <CardHeader className='items-center'>
          <CardTitle> Welcome back!</CardTitle>
          <CardDescription className='text-center'>A decentralized network awaits</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <LoginForm />
          <Button className='text-white' variant='link' onClick={gotoRestorePage}>
            Forgot Password?
          </Button>
          <p className='text-center text-sm'>
            Need help? Contact{' '}
            <a
              className='cursor-pointer text-sm text-teal-500 hover:underline'
              target='_blank'
              href='https://discord.com/channels/824484045370818580/1077672871251415141'
            >
              Penumbra Support
            </a>
          </p>
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
