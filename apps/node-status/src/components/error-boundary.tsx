import { SplashPage } from '@penumbra-zone/ui/components/ui/splash-page';
import { useRouteError } from 'react-router-dom';

export const ErrorBoundary = () => {
  const error = useRouteError();

  console.error('ErrorBoundary caught error:', error);

  return (
    <SplashPage title='Error' description='Something went wrong while loading this page.'>
      {String(error)}
    </SplashPage>
  );
};
