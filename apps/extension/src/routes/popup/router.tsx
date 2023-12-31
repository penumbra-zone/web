import { createHashRouter, RouteObject } from 'react-router-dom';
import { PopupIndex, popupIndexLoader } from './home';
import { Login } from './login';
import { PopupPath } from './paths';
import { PopupLayout } from './popup-layout';
import { Settings } from './settings';
import { settingsRoutes } from './settings/routes';
import { TransactionApproval } from './approval/transaction';

export const popupRoutes: RouteObject[] = [
  {
    element: <PopupLayout />,
    children: [
      {
        path: PopupPath.INDEX,
        element: <PopupIndex />,
        loader: popupIndexLoader,
      },
      {
        path: PopupPath.LOGIN,
        element: <Login />,
      },
      {
        path: PopupPath.SETTINGS,
        element: <Settings />,
        children: settingsRoutes,
      },
      {
        path: PopupPath.TRANSACTION_APPROVAL,
        element: <TransactionApproval />,
      },
    ],
  },
];

export const popupRouter = createHashRouter(popupRoutes);
