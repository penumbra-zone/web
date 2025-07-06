import { createHashRouter, redirect, type RouteObject } from 'react-router-dom';
import { PagePath } from '@/shared/const/page';
import { Portfolio } from '@/pages/portfolio';
import { AllTransactionsPage } from '@/pages/portfolio/ui/transactions/all-transactions-page';
import { Transfer } from '@/pages/transfer';
import { Shielding } from '@/pages/shielding';
import { NotFoundPage } from '@/pages/not-found';
import { Layout } from './layout';
import { abortLoader } from '@/shared/lib/abort-loader';
import { ErrorBoundary } from '@/shared/components/error-boundary';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    loader: abortLoader,
    children: [
      { index: true, loader: () => redirect(PagePath.Portfolio) },
      {
        path: PagePath.Portfolio,
        element: <Portfolio />,
      },
      {
        path: PagePath.Transactions,
        element: <AllTransactionsPage />,
      },
      {
        path: PagePath.Transfer,
        element: <Transfer />,
      },
      {
        path: PagePath.Shielding,
        element: <Shielding />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

export const router: ReturnType<typeof createHashRouter> = createHashRouter(routes);
