import { SplashPage } from '@penumbra-zone/ui';
import { HeadTag } from './metadata/head-tag';

export const ExtensionUnavailable = () => {
  return (
    <>
      <HeadTag />

      <SplashPage title='Penumbra extension unavailble'>
        {`We can't currently connect to the Penumbra extension. This could be because the RPC node
        that you're connected to is down. Please try reloading this page; and if that doesn't work,
        please consider using a different RPC node.`}
      </SplashPage>
    </>
  );
};
