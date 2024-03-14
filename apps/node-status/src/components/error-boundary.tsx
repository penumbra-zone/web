import { SplashPage } from '@penumbra-zone/ui';
import { useRouteError } from 'react-router-dom';

export const ErrorBoundary = () => {
  const error = useRouteError();

  console.error('ErrorBoundary caught error:', error);

  return (
    <SplashPage title='Uh-oh!' description='Looks like there was an error.'>
      {String(error)}
    </SplashPage>
  );
};
