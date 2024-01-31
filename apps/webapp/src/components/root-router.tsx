import { createHashRouter, redirect } from 'react-router-dom';
import { PagePath } from './metadata/paths.ts';
import { Layout, LayoutLoader } from './layout.tsx';
import AssetsTable, { AssetsLoader } from './dashboard/assets-table.tsx';
import TransactionTable, { TxsLoader } from './dashboard/transaction-table.tsx';
import { DashboardLayout } from './dashboard/layout.tsx';
import { TxDetails, TxDetailsErrorBoundary, TxDetailsLoader } from './tx-details';
import { SendLayout } from './send/layout.tsx';
import { SendAssetBalanceLoader, SendForm } from './send/send-form.tsx';
import IbcForm, { IbcAssetBalanceLoader } from './send/ibc/ibc-form.tsx';
import { Receive } from './send/receive.tsx';
import { ErrorBoundary } from './shared/error-boundary.tsx';
import { SwapLayout, SwapLoader } from './swap/layout.tsx';

export const rootRouter = createHashRouter([
  {
    path: '/',
    loader: LayoutLoader,
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
            loader: AssetsLoader,
            element: <AssetsTable />,
            errorElement: <ErrorBoundary />,
          },
          {
            path: PagePath.TRANSACTIONS,
            loader: TxsLoader,
            element: <TransactionTable />,
            errorElement: <ErrorBoundary />,
          },
        ],
      },
      {
        path: PagePath.SEND,
        element: <SendLayout />,
        children: [
          {
            index: true,
            loader: SendAssetBalanceLoader,
            element: <SendForm />,
          },
          {
            path: PagePath.RECEIVE,
            element: <Receive />,
          },
          {
            path: PagePath.IBC,
            loader: IbcAssetBalanceLoader,
            element: <IbcForm />,
          },
        ],
      },
      {
        path: PagePath.SWAP,
        loader: SwapLoader,
        element: <SwapLayout />,
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
