import { createHashRouter, redirect, type RouteObject } from 'react-router-dom';
import { PagePath } from '@shared/const/page';
import { Portfolio } from '@pages/portfolio';
import { AllTransactionsPage } from '@pages/portfolio/transactions/AllTransactionsPage';
import { NotFoundPage } from '@pages/not-found';
import { Layout } from '@app/layout';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
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
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

export const router: ReturnType<typeof createHashRouter> = createHashRouter(routes);
