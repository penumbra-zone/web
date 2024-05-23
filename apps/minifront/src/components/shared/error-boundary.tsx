import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { ExtensionNotConnected } from '../extension-not-connected';
import { NotFound } from '../not-found';
import { SplashPage } from '@penumbra-zone/ui/components/ui/splash-page';
import { PraxNotConnectedError } from '@penumbra-zone/client/prax';

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof PraxNotConnectedError) return <ExtensionNotConnected />;
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;

  console.error('ErrorBoundary caught error:', error);

  return (
    <SplashPage title='Error' description='Something went wrong while loading this page.'>
      {String(error)}
    </SplashPage>
  );
};
