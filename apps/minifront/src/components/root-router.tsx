import { createHashRouter, redirect } from 'react-router-dom';
import { PagePath } from './metadata/paths';
import { Layout } from './layout';
import AssetsTable from './dashboard/assets-table';
import TransactionTable from './dashboard/transaction-table';
import { DashboardLayout } from './dashboard/layout';
import { TxDetails, TxDetailsErrorBoundary } from './tx-details';
import { SendLayout } from './send/layout';
import { SendForm } from './send/send-form';
import { Receive } from './send/receive';
import { ErrorBoundary } from './shared/error-boundary';
import { SwapLayout } from './swap/layout';
import { StakingLayout } from './staking/layout';
import { IbcLayout } from './ibc/layout';
import { abortLoader } from '../abort-loader';
import type { Router } from '@remix-run/router';
import { routes as v2Routes } from './v2/root-router';

export const rootRouter: Router = createHashRouter([
  ...v2Routes,
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    loader: abortLoader,
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
        ],
      },
      {
        path: PagePath.SWAP,
        element: <SwapLayout />,
      },
      {
        path: PagePath.TRANSACTION_DETAILS,
        element: <TxDetails />,
        errorElement: <TxDetailsErrorBoundary />,
      },
      {
        path: PagePath.STAKING,
        element: <StakingLayout />,
      },
      {
        path: PagePath.DEPOSIT_SKIP,
        element: <IbcLayout />,
      },
      {
        path: PagePath.DEPOSIT_MANUAL,
        element: <IbcLayout />,
      },
      {
        path: PagePath.WITHDRAW,
        element: <IbcLayout />,
      },
    ],
  },
]);
