import { SplashPage } from '@penumbra-zone/ui/components/ui/splash-page';
import { HeadTag } from './metadata/head-tag';

export const ExtensionUnavailable = () => {
  return (
    <>
      <HeadTag />

      <SplashPage title='Penumbra extension unavailable'>
        <p className='mb-2'>We can&apos;t currently connect to the Penumbra extension.</p>
        <p className='mb-2'>
          This page may have been left open for too long, causing a timeout. Please reload this page
          and see if that fixes the issue.
        </p>
        <p>
          If it doesn&apos;t, please check the status page of the rpc provider in your extension
        </p>
      </SplashPage>
    </>
  );
};
