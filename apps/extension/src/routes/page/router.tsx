import { createMemoryRouter, Outlet, RouteObject } from 'react-router-dom';
import { PageIndex, pageIndexLoader } from './index';
import { PagePath } from './paths';
import { Onboarding } from './onboarding';
import { onboardingRoutes } from './onboarding/routes';

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
        path: PagePath.WELCOME,
        element: <Onboarding />,
        children: onboardingRoutes,
      },
    ],
  },
];

export const pageRouter = createMemoryRouter(pageRoutes);
