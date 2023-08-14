import { createMemoryRouter, Outlet, RouteObject } from 'react-router-dom';
import { PageIndex, pageIndexLoader } from './index';
import { Onboarding } from './onboarding';
import { PagePath } from './paths';

export const pageRoutes: RouteObject[] = [
  {
    element: <Outlet />,
    children: [
      {
        path: PagePath.INDEX,
        element: <PageIndex />,
        loader: pageIndexLoader,
      },
      {
        path: PagePath.ONBOARDING,
        element: <Onboarding />,
      },
    ],
  },
];

export const pageRouter = createMemoryRouter(pageRoutes);
