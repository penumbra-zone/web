import { PagePath } from '../paths';
import { OnboardingStart } from './start';
import { ImportSeedPhrase } from './import';
import { GenerateSeedPhrase } from './generate';
import { ConfirmBackup } from './confirm-backup';
import { ChooseEndpoint } from './choose-endpoint';
import { SetPassword } from './set-password';
import { OnboardingSuccess } from './success';
import { pageIndexLoader } from '..';

export const onboardingRoutes = [
  {
    path: PagePath.WELCOME,
    element: <OnboardingStart />,
  },
  {
    path: PagePath.IMPORT_SEED_PHRASE,
    element: <ImportSeedPhrase />,
  },
  {
    path: PagePath.GENERATE_SEED_PHRASE,
    element: <GenerateSeedPhrase />,
  },
  {
    path: PagePath.CONFIRM_BACKUP,
    element: <ConfirmBackup />,
  },
  {
    path: PagePath.CHOOSE_ENDPOINT,
    element: <ChooseEndpoint />,
  },
  {
    path: PagePath.SET_PASSWORD,
    element: <SetPassword />,
  },
  {
    path: PagePath.ONBOARDING_SUCCESS,
    element: <OnboardingSuccess />,
    loader: pageIndexLoader,
  },
];
