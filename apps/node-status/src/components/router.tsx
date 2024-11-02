import { createHashRouter } from 'react-router-dom';
import { ErrorBoundary } from './error-boundary';
import { Index } from '.';
import { IndexLoader } from '../fetching/loader';

export const router: ReturnType<typeof createHashRouter> = createHashRouter([
  {
    path: '/',
    loader: IndexLoader,
    element: <Index />,
    errorElement: <ErrorBoundary />,
  },
]);
