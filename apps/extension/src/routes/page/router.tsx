import { createHashRouter, Outlet, RouteObject } from 'react-router-dom';
import { PageIndex, pageIndexLoader } from './index';
import { Login } from './login';
import { Onboarding } from './onboarding';
import { onboardingRoutes } from './onboarding/routes';
import { PagePath } from './paths';
import { RestorePasswordIndex } from './restore-password';
import { restorePasswordRoutes } from './restore-password/routes';

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
      {
        path: PagePath.RESTORE_PASSWORD,
        element: <RestorePasswordIndex />,
        children: restorePasswordRoutes,
      },
      {
        path: PagePath.LOGIN,
        element: <Login />,
      },
    ],
  },
];

export const pageRouter = createHashRouter(pageRoutes);
