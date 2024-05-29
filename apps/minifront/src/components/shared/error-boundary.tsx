import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import {
  PraxNotAvailableError,
  PraxNotConnectedError,
  PraxNotInstalledError,
} from '@penumbra-zone/client/prax';
import { ExtensionNotConnected } from '../extension-not-connected';
import { NotFound } from '../not-found';
import { ExtensionTransportDisconnected } from '../extension-transport-disconnected';
import { ExtensionNotInstalled } from '../extension-not-installed';
import { Code, ConnectError } from '@connectrpc/connect';
import { SplashPage } from '@penumbra-zone/ui/components/ui/splash-page';

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof ConnectError && error.code === Code.Unavailable)
    return <ExtensionTransportDisconnected />;
  if (error instanceof PraxNotInstalledError || error instanceof PraxNotAvailableError)
    return <ExtensionNotInstalled />;
  if (error instanceof PraxNotConnectedError) return <ExtensionNotConnected />;
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;

  console.error('ErrorBoundary caught error:', error);

  return (
    <SplashPage title='Error' description='Something went wrong while loading this page.'>
      {String(error)}
    </SplashPage>
  );
};
