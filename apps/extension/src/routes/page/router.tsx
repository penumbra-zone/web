import { createMemoryRouter, Outlet, RouteObject } from 'react-router-dom';
import { pagePaths } from './paths';
import { PageIndex } from './index';

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
