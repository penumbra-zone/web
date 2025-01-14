import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Code, ConnectError } from '@connectrpc/connect';
import {
  PenumbraNotInstalledError,
  PenumbraProviderNotConnectedError,
} from '@penumbra-zone/client';
import { SplashPage } from '@penumbra-zone/ui-deprecated/components/ui/splash-page';
import { NotFound } from '../not-found';
import { ExtensionTransportDisconnected } from '../extension-transport-disconnected';
import { ExtensionNotInstalled } from '../extension-not-installed';
import { ExtensionNotConnected } from '../extension-not-connected';

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof ConnectError && error.code === Code.Unavailable) {
    return <ExtensionTransportDisconnected />;
  }
  if (error instanceof PenumbraNotInstalledError) {
    return <ExtensionNotInstalled />;
  }
  if (error instanceof PenumbraProviderNotConnectedError) {
    return <ExtensionNotConnected />;
  }
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  console.error('ErrorBoundary caught error:', error);

  return (
    <SplashPage title='Error' description='Something went wrong while loading this page.'>
      {String(error)}
    </SplashPage>
  );
};
