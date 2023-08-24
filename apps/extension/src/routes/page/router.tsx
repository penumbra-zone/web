import { createMemoryRouter, RouteObject } from 'react-router-dom';
import { RestorePassword } from './restore-password';
import { PageIndex, pageIndexLoader } from './index';
import { Login } from './login';
import { Onboarding } from './onboarding';
import { onboardingRoutes } from './onboarding/routes';
import { PageLayout } from './page-layout';
import { PagePath } from './paths';

export const pageRoutes: RouteObject[] = [
  {
    element: <PageLayout />,
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
      {
        path: PagePath.RESTORE_PASSWORD,
        element: <RestorePassword />,
      },
      {
        path: PagePath.LOGIN,
        element: <Login />,
      },
    ],
  },
];

export const pageRouter = createMemoryRouter(pageRoutes);
