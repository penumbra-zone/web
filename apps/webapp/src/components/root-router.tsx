import { createBrowserRouter, redirect } from 'react-router-dom';
import { PagePath } from './metadata/paths.ts';
import { Layout } from './layout.tsx';
import AssetsTable from './dashboard/assets-table.tsx';
import TransactionTable from './dashboard/transaction-table.tsx';
import { DashboardLayout } from './dashboard/layout.tsx';
import { TxDetails, TxDetailsErrorBoundary, TxDetailsLoader } from './tx-details';
import { SendLayout } from './send/layout.tsx';
import { SendForm } from './send/send-form.tsx';
import IbcForm from './send/ibc-form.tsx';
import Receive from './send/receive.tsx';
import { ErrorBoundary } from './shared/error-boundary.tsx';

export const rootRouter = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
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
        path: PagePath.SEND,
        element: <SendLayout />,
        children: [
          {
            index: true,
            element: <SendForm />,
          },
          {
            path: PagePath.RECEIVE,
            element: <Receive />,
          },
          {
            path: PagePath.IBC,
            element: <IbcForm />,
          },
        ],
      },
      {
        path: PagePath.TRANSACTION_DETAILS,
        loader: TxDetailsLoader,
        element: <TxDetails />,
        errorElement: <TxDetailsErrorBoundary />,
      },
    ],
  },
]);
