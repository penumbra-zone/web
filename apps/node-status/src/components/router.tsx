import { createHashRouter } from 'react-router-dom';
import { ErrorBoundary } from './error-boundary';
import { Index } from '.';
import { IndexLoader } from '../fetching/loader';

export const router = createHashRouter([
  {
    path: '/',
    loader: IndexLoader,
    element: <Index />,
    errorElement: <ErrorBoundary />,
  },
]);
