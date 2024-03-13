import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { PraxNotConnectedError } from '@penumbra-zone/client';
import { ExtensionNotConnected } from '../extension-not-connected';
import { NotFound } from '../not-found';

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof PraxNotConnectedError) return <ExtensionNotConnected />;
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;

  console.error('ErrorBoundary caught error:', error);

  return (
    <div className='text-red'>
      <h1 className='text-xl'>{String(error)}</h1>
    </div>
  );
};
