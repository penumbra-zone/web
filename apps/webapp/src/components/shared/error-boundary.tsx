import { useRouteError } from 'react-router-dom';
import { ExtensionNotInstalledError } from '../../utils/extension-not-installed-error';
import { ExtensionNotInstalled } from '../extension-not-installed';

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error instanceof ExtensionNotInstalledError) return <ExtensionNotInstalled />;

  console.error(error);

  return (
    <div className='text-red'>
      <h1 className='text-xl'>{String(error)}</h1>
    </div>
  );
};
