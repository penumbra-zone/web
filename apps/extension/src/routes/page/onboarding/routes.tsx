import { PagePath } from '../paths';
import { OnboardingStart } from './start';
import { GenerateSeedPhrase } from './generate';
import { ConfirmBackup } from './confirm-backup';
import { ImportSeedPhrase } from './import';
import { OnboardingSuccess } from './success';
import { SetPassword } from './set-password';

export const onboardingRoutes = [
  {
    path: PagePath.WELCOME_INDEX,
    element: <OnboardingStart />,
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
    path: PagePath.IMPORT_SEED_PHRASE,
    element: <ImportSeedPhrase />,
  },
  {
    path: PagePath.ONBOARDING_SUCCESS,
    element: <OnboardingSuccess />,
  },
  {
    path: PagePath.SET_PASSWORD,
    element: <SetPassword />,
  },
];
