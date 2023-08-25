import { Button, Card, CardContent, CompressedVideoLogo } from 'ui/components';
import { FadeTransition, LoginForm } from '../../components';
import { usePageNav } from '../../utils/navigate';
import { PagePath } from './paths';

export const Login = () => {
  const navigate = usePageNav();

  return (
    <FadeTransition>
      <CompressedVideoLogo className='mb-12 self-center' noWords />
      <Card className='w-[500px] p-6' gradient>
        <CardContent className='grid gap-4'>
          <LoginForm />
        </CardContent>
      </Card>
      <div className='mt-12 flex flex-col items-center'>
        <Button
          className='text-gray-500'
          variant='link'
          onClick={() => navigate(PagePath.RESTORE_PASSWORD)}
        >
          Forgot Password?
        </Button>
        <p className='text-center text-sm text-gray-500'>
          Need help? Contact{' '}
          <a
            className='cursor-pointer text-sm text-teal-500 hover:underline'
            target='_blank'
            href='https://discord.com/channels/824484045370818580/1077672871251415141'
          >
            Penumbra Support
          </a>
        </p>
      </div>
    </FadeTransition>
  );
};
