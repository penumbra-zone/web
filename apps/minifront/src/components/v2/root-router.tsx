import { redirect, RouteObject } from 'react-router-dom';

import { abortLoader } from '../../abort-loader';
import { PagePath } from '../metadata/paths';
import { Layout } from './layout';
import { Portfolio } from './portfolio';
import { AllTransactionsPage } from './portfolio/transactions/AllTransactionsPage';
import { TransferLayout } from './transfer';
import { SendPage } from './transfer/send-page';

/** @todo: Delete this helper once we switch over to the v2 layout. */
const temporarilyPrefixPathsWithV2 = (routes: RouteObject[]): RouteObject[] =>
  routes.map(route => {
    if (route.index) {
      return route;
    }

    // Don't double-prefix paths that already start with /v2/
    const path = route.path ?? '';
    const pathAlreadyHasV2Prefix = path.startsWith('/v2/') || path === '/v2';
    const newPath = pathAlreadyHasV2Prefix ? path : `/v2${path === '/' ? '' : path}`;

    return {
      ...route,
      path: newPath,
      ...(route.children ? { children: temporarilyPrefixPathsWithV2(route.children) } : {}),
    };
  });

/**
 * @todo: Once we switch over to the v2 layout, we need to:
 * 1) pass these routes to `createHashRouter()` and export the returned router,
 * like in `../root-router.tsx`.
 * 2) remove the call to `temporarilyPrefixPathsWithV2()`.
 */
export const routes: RouteObject[] = temporarilyPrefixPathsWithV2([
  {
    path: '/',
    element: <Layout />,
    loader: abortLoader,
    children: [
      { index: true, loader: () => redirect(PagePath.V2_PORTFOLIO) },
      // Portfolio page (/v2/portfolio)
      {
        path: PagePath.V2_PORTFOLIO.replace('/v2', ''), // Strip /v2 prefix as temporarilyPrefixPathsWithV2 will add it
        element: <Portfolio />,
      },
      // All Transactions page (/v2/portfolio/transactions)
      {
        path: PagePath.V2_TRANSACTIONS_FULL.replace('/v2', ''), // Strip /v2 prefix as temporarilyPrefixPathsWithV2 will add it
        element: <AllTransactionsPage />,
      },
      // Send page (/v2/send)
      {
        path: PagePath.SEND,
        element: <TransferLayout />,
        children: [
          {
            index: true,
            element: <SendPage />,
          },
        ],
      },
      // For backward compatibility, redirect old dashboard paths to new V2 paths
      {
        path: PagePath.DASHBOARD,
        loader: () => redirect(PagePath.V2_PORTFOLIO),
      },
      {
        path: PagePath.TRANSACTIONS,
        loader: () => redirect(PagePath.V2_TRANSACTIONS_FULL),
      },
    ],
  },
]);
