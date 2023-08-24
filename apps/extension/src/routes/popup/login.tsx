import { Button } from 'ui/components';
import { FadeTransition, LoginForm } from '../../components';
import { PagePath } from '../page/paths';

export const Login = () => {
  const gotoRestorePage = () =>
    void (async function () {
      await chrome.tabs.create({
        url: `${chrome.runtime.getURL('page.html')}#${PagePath.RESTORE_PASSWORD}`,
      });
    })();

  return (
    <FadeTransition>
      <div className='grid gap-4 p-6 text-white shadow-sm'>
        <p className='text-center text-2xl font-semibold leading-none tracking-tight'>
          Welcome back!
        </p>
        <p className='text-center text-sm text-muted-foreground'>A decentralized network awaits</p>
        <div className='grid gap-4 p-6 pt-0'>
          <LoginForm />
          <Button className='text-white' variant='link' onClick={gotoRestorePage}>
            Forgot Password?
          </Button>
          <p className='text-sm'>
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
      </div>
    </FadeTransition>
  );
};
