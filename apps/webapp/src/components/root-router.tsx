import { createHashRouter, redirect } from 'react-router-dom';
import { PagePath } from './metadata/paths';
import { Layout, LayoutLoader } from './layout';
import AssetsTable, { AssetsLoader } from './dashboard/assets-table';
import TransactionTable, { TxsLoader } from './dashboard/transaction-table';
import { DashboardLayout } from './dashboard/layout';
import { TxDetails, TxDetailsErrorBoundary, TxDetailsLoader } from './tx-details';
import { SendLayout } from './send/layout';
import { SendAssetBalanceLoader, SendForm } from './send/send-form/index';
import IbcForm, { IbcAssetBalanceLoader } from './send/ibc/ibc-form';
import { Receive } from './send/receive';
import { ErrorBoundary } from './shared/error-boundary';
import { SwapLayout } from './swap/layout';
import { SwapLoader } from './swap/swap-loader';
import { StakingLayout, StakingLoader } from './staking/layout';

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
      {
        path: PagePath.STAKING,
        loader: StakingLoader,
        element: <StakingLayout />,
      },
    ],
  },
]);
