import { PagePath } from '../paths';
import { OnboardingStart } from './start';
import { GenerateSeedPhrase } from './generate';
import { ConfirmBackup } from './confirm-backup';
import { ImportSeedPhrase } from './import';
import { OnboardingSuccess } from './success';
import { SetPassword } from './set-password';
import { pageIndexLoader } from '..';
import { SetRpcEndpoint } from './set-rpc-endpoint';

export const onboardingRoutes = [
  {
    path: PagePath.WELCOME,
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
    path: PagePath.SET_PASSWORD,
    element: <SetPassword />,
  },
  {
    path: PagePath.SET_RPC_ENDPOINT,
    element: <SetRpcEndpoint />,
  },
  {
    path: PagePath.ONBOARDING_SUCCESS,
    element: <OnboardingSuccess />,
    loader: pageIndexLoader,
  },
];
