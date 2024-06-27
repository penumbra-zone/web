import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import {
  PenumbraProviderNotInstalledError,
  PenumbraProviderNotConnectedError,
} from '@penumbra-zone/client';
import { ExtensionNotConnected } from '../extension-not-connected';
import { NotFound } from '../not-found';
import { ExtensionTransportDisconnected } from '../extension-transport-disconnected';
import { ExtensionNotInstalled } from '../extension-not-installed';
import { Code, ConnectError } from '@connectrpc/connect';
import { SplashPage } from '@repo/ui/components/ui/splash-page';

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof ConnectError && error.code === Code.Unavailable)
    return <ExtensionTransportDisconnected />;
  if (error instanceof PenumbraProviderNotInstalledError) return <ExtensionNotInstalled />;
  if (error instanceof PenumbraProviderNotConnectedError) return <ExtensionNotConnected />;
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;

  console.error('ErrorBoundary caught error:', error);

  return (
    <SplashPage title='Error' description='Something went wrong while loading this page.'>
      {String(error)}
    </SplashPage>
  );
};
