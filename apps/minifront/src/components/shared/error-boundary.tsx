import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { PraxNotConnectedError } from '@penumbra-zone/client';
import { ExtensionNotConnected } from '../extension-not-connected';
import { NotFound } from '../not-found';
import { ExtensionUnavailable } from '../extension-unavailable';
import { Code, ConnectError } from '@connectrpc/connect';
import { SplashPage } from '@penumbra-zone/ui';

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof ConnectError && error.code === Code.Unavailable) {
    return <ExtensionUnavailable />;
  }
  if (error instanceof PraxNotConnectedError) return <ExtensionNotConnected />;
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;

  console.error('ErrorBoundary caught error:', error);

  return (
    <SplashPage title='Error' description='Something went wrong while loading this page.'>
      {String(error)}
    </SplashPage>
  );
};
