import { RouteObject } from 'react-router-dom';
import { PagePath } from '../metadata/paths.ts';
import TransactionTable from './transaction-table.tsx';
import { DashboardLayout } from './layout.tsx';
import AssetsTable from './assets-table.tsx';

export const dashboardRoutes = {
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
} satisfies RouteObject;
