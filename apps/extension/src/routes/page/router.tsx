import { createMemoryRouter, Outlet, RouteObject } from 'react-router-dom';
import { PageIndex } from './index';
import { pagePaths } from './paths';

export const pageRoutes: RouteObject[] = [
  {
    element: <Outlet />,

    children: [
      {
        path: pagePaths.INDEX,
        element: <PageIndex />,
      },
    ],
  },
];

export const pageRouter = createMemoryRouter(pageRoutes);
