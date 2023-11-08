import { createBrowserRouter, redirect } from 'react-router-dom';
import { PagePath } from './metadata/paths.ts';
import { Layout } from './layout.tsx';
import AssetsTable from './dashboard/assets-table.tsx';
import TransactionTable from './dashboard/transaction-table.tsx';
import { DashboardLayout } from './dashboard/layout.tsx';
import { TxDetails } from './tx-details';

export const rootRouter = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, loader: () => redirect(PagePath.DASHBOARD) },
      {
        path: PagePath.DASHBOARD,
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AssetsTable />,
          },
          {
            path: PagePath.TRANSACTIONS,
            element: <TransactionTable />,
          },
        ],
      },
      {
        path: PagePath.TRANSACTION_DETAILS,
        element: <TxDetails />,
      },
    ],
  },
]);
