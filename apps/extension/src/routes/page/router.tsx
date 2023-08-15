import { createMemoryRouter, Outlet, RouteObject } from 'react-router-dom';
import { PageIndex, pageIndexLoader } from './index';
import { PagePath } from './paths';
import { Onboarding } from './onboarding';
import { GenerateSeedPhrase } from './onboarding/generate';
import { OnboardingStart } from './onboarding/start';
import { ImportSeedPhrase } from './onboarding/import';

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
        children: [
          {
            path: PagePath.WELCOME_INDEX,
            element: <OnboardingStart />,
          },
          {
            path: PagePath.GENERATE_SEED_PHRASE,
            element: <GenerateSeedPhrase />,
          },
          {
            path: PagePath.IMPORT_SEED_PHRASE,
            element: <ImportSeedPhrase />,
          },
        ],
      },
    ],
  },
];

export const pageRouter = createMemoryRouter(pageRoutes);
