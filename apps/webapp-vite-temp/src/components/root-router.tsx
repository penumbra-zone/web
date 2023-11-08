import { createBrowserRouter, redirect } from 'react-router-dom';
import { PagePath } from './metadata/paths.ts';
import { Layout } from './layout.tsx';
import { dashboardRoutes } from './dashboard/routes.tsx';

export const rootRouter = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [{ index: true, loader: () => redirect(PagePath.DASHBOARD) }, dashboardRoutes],
  },
]);
