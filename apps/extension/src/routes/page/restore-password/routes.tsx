import { PagePath } from '../paths';
import { RestorePassword } from './restore-password';
import { SetPassword } from './set-password';

export const restorePasswordRoutes = [
  {
    path: PagePath.RESTORE_PASSWORD,
    element: <RestorePassword />,
  },
  {
    path: PagePath.RESTORE_PASSWORD_SET_PASSWORD,
    element: <SetPassword />,
  },
];
