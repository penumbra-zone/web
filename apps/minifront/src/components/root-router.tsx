import { createHashRouter, redirect } from 'react-router-dom';
import { PagePath } from './metadata/paths';
import { Layout } from './layout';
import AssetsTable, { AssetsLoader } from './dashboard/assets-table';
import TransactionTable from './dashboard/transaction-table';
import { DashboardLayout } from './dashboard/layout';
import { TxDetails, TxDetailsErrorBoundary, TxDetailsLoader } from './tx-details';
import { SendLayout } from './send/layout';
import { SendAssetBalanceLoader, SendForm } from './send/send-form';
import { Receive } from './send/receive';
import { ErrorBoundary } from './shared/error-boundary';
import { SwapLayout } from './swap/layout';
import { SwapLoader } from './swap/swap-loader';
import { StakingLayout, StakingLoader } from './staking/layout';
import { IbcLoader } from './ibc/ibc-loader';
import { IbcLayout } from './ibc/layout';
import type { Router } from '@remix-run/router';

export const rootRouter: Router = createHashRouter([
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
            loader: AssetsLoader,
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
            loader: SendAssetBalanceLoader,
            element: <SendForm />,
          },
          {
            path: PagePath.RECEIVE,
            element: <Receive />,
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
      {
        path: PagePath.STAKING,
        loader: StakingLoader,
        element: <StakingLayout />,
      },
      {
        path: PagePath.IBC,
        loader: IbcLoader,
        element: <IbcLayout />,
      },
    ],
  },
]);
