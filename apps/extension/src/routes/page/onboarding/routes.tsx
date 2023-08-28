import { PagePath } from '../paths';
import { OnboardingStart } from './start';
import { GenerateSeedPhrase } from './generate';
import { ConfirmBackup } from './confirm-backup';
import { ImportSeedPhrase } from './import';
import { OnboardingSuccess } from './success';
import { SetPassword } from './set-password';
import { onboardingIndexLoader } from '.';
import { pageIndexLoader } from '..';

export const onboardingRoutes = [
  {
    path: PagePath.WELCOME_INDEX,
    element: <OnboardingStart />,
    loader: onboardingIndexLoader,
  },
  {
    path: PagePath.GENERATE_SEED_PHRASE,
    element: <GenerateSeedPhrase />,
    loader: onboardingIndexLoader,
  },
  {
    path: PagePath.CONFIRM_BACKUP,
    element: <ConfirmBackup />,
    loader: onboardingIndexLoader,
  },
  {
    path: PagePath.IMPORT_SEED_PHRASE,
    element: <ImportSeedPhrase />,
    loader: onboardingIndexLoader,
  },
  {
    path: PagePath.ONBOARDING_SUCCESS,
    element: <OnboardingSuccess />,
    loader: pageIndexLoader,
  },
  {
    path: PagePath.SET_PASSWORD,
    element: <SetPassword />,
    loader: onboardingIndexLoader,
  },
];
