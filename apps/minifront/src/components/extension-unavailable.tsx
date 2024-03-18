import { SplashPage } from '@penumbra-zone/ui/components/ui/splash-page';
import { HeadTag } from './metadata/head-tag';

const NODE_STATUS_PAGE_URL =
  window.location.hostname === 'localhost' ? 'http://localhost:5174' : '/';

export const ExtensionUnavailable = () => {
  return (
    <>
      <HeadTag />

      <SplashPage title='Penumbra extension unavailble'>
        <p className='mb-2'>We can&apos;t currently connect to the Penumbra extension.</p>
        <p className='mb-2'>
          This page may have been left open for too long, causing a timeout. Please reload this page
          and see if that fixes the issue.
        </p>
        <p>
          If it doesn&apos;t, the RPC node that you&apos;re connected to could be down. Check{' '}
          <a href={NODE_STATUS_PAGE_URL} className='underline'>
            the node&apos;s status page
          </a>{' '}
          and, if it is down, consider switching to a different RPC URL in the Penumbra
          extension&apos;s settings.
        </p>
      </SplashPage>
    </>
  );
};
