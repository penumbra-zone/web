import { createMemoryRouter, RouteObject } from 'react-router-dom';
import { PageIndex, pageIndexLoader } from './index';
import { PagePath } from './paths';
import { Onboarding } from './onboarding';
import { onboardingRoutes } from './onboarding/routes';
import { ForgotPassword } from './forgot-password';
import { PageRoot } from './page-root';

export const pageRoutes: RouteObject[] = [
  {
    element: <PageRoot />,
    children: [
      {
        path: PagePath.FORGOT_PASSWORD,
        element: <ForgotPassword />,
      },
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
