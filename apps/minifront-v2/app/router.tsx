import { createHashRouter, redirect } from 'react-router-dom';
import { PagePath } from '@shared/const/page';
import { Portfolio } from '@pages/portfolio';
import { TransactionsPage } from '@pages/portfolio/transactions';
import { Layout } from '@app/layout';

export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, loader: () => redirect(PagePath.Portfolio) },
      {
        path: PagePath.Portfolio,
        element: <Portfolio />,
        children: [
          {
            path: PagePath.Transactions,
            element: <TransactionsPage />,
          },
        ],
      },
    ],
  },
]);
