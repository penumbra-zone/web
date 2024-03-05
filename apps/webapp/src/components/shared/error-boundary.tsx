import { useRouteError } from 'react-router-dom';
import { PraxNotConnectedError } from '@penumbra-zone/client';
import { ExtensionNotConnected } from '../extension-not-connected';

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof PraxNotConnectedError) return <ExtensionNotConnected />;

  console.error(error);

  return (
    <div className='text-red'>
      <h1 className='text-xl'>{String(error)}</h1>
    </div>
  );
};
