import { createHashRouter } from 'react-router-dom';
import { ErrorBoundary } from './error-boundary.tsx';
import { Index } from './index.tsx';
import { IndexLoader } from '../fetching/loader.ts';

export const router = createHashRouter([
  {
    path: '/',
    loader: IndexLoader,
    element: <Index />,
    errorElement: <ErrorBoundary />,
  },
]);
