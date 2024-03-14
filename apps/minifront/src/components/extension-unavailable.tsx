import { SplashPage } from '@penumbra-zone/ui';
import { HeadTag } from './metadata/head-tag';

const NODE_STATUS_PAGE_URL =
  window.location.hostname === 'localhost' ? 'http://localhost:5174' : '/';

export const ExtensionUnavailable = () => {
  return (
    <>
      <HeadTag />

      <SplashPage title='Penumbra extension unavailble'>
        {`We can't currently connect to the Penumbra extension. This could be because the RPC node
        that you're connected to is down. Please check `}
        <a href={NODE_STATUS_PAGE_URL} className='underline'>
          the node&apos;s status page
        </a>
        ;
        {` and if that doesn't work,
        please consider using a different RPC node.`}
      </SplashPage>
    </>
  );
};
