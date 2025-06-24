import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Code, ConnectError } from '@connectrpc/connect';
import {
  PenumbraNotInstalledError,
  PenumbraProviderNotConnectedError,
} from '@penumbra-zone/client';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Card } from '@penumbra-zone/ui/Card';
import { ExtensionNotInstalled } from './extension-not-installed';
import { ExtensionNotConnected } from './extension-not-connected';
import { ExtensionTransportDisconnected } from './extension-transport-disconnected';

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
    <div
      className='flex min-h-screen flex-col items-center justify-center p-8'
      style={{
        backgroundImage: `url('/assets/background/shield-background.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className='w-full max-w-md'>
        <Card>
          <div className='flex flex-col items-center space-y-6 text-center'>
            <Text h4 color='text.primary'>
              Error
            </Text>

            <Text color='text.primary'>Something went wrong while loading this page.</Text>

            <Text small color='text.secondary' align='center'>
              {String(error)}
            </Text>

            <Button
              actionType='accent'
              priority='primary'
              density='sparse'
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </Card>
      </div>

      <div className='mt-8 flex px-3'>
        <Text detail>
          Minifront is a minimal frontend for interacting with the Penumbra blockchain—embedded into
          every Penumbra RPC endpoint.
        </Text>
      </div>
    </div>
  );
};

const NotFound = () => (
  <div
    className='flex min-h-screen flex-col items-center justify-center p-8'
    style={{
      backgroundImage: `url('/assets/background/shield-background.svg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  >
    <div className='w-full max-w-md'>
      <Card>
        <div className='flex flex-col items-center space-y-6 text-center'>
          <Text h4 color='text.primary'>
            404 - Page Not Found
          </Text>

          <Text color='text.primary'>The page you're looking for doesn't exist.</Text>

          <Button
            actionType='accent'
            priority='primary'
            density='sparse'
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </Card>
    </div>

    <div className='mt-8 flex px-3'>
      <Text detail>
        Minifront is a minimal frontend for interacting with the Penumbra blockchain—embedded into
        every Penumbra RPC endpoint.
      </Text>
    </div>
  </div>
);
