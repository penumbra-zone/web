import { redirect, RouteObject } from 'react-router-dom';
import { Layout } from './layout';
import { abortLoader } from '../../abort-loader';
import { PagePath } from '../metadata/paths';
import { PortfolioLayout } from './portfolio';
import { TransactionsPage } from './portfolio/transactions';
import { TransferLayout } from './transfer';
import { SendPage } from './transfer/send-page';

/** @todo: Delete this helper once we switch over to the v2 layout. */
const temporarilyPrefixPathsWithV2 = (routes: RouteObject[]): RouteObject[] =>
  routes.map(route => {
    if (route.index) {
      return route;
    }

    return {
      ...route,
      path: `/v2${route.path === '/' ? '' : route.path}`,
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
      { index: true, loader: () => redirect(`/v2${PagePath.DASHBOARD}`) },
      {
        path: PagePath.DASHBOARD,
        element: <PortfolioLayout />,
        children: [
          {
            path: PagePath.TRANSACTIONS,
            element: <TransactionsPage />,
          },
        ],
      },
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
    ],
  },
]);
