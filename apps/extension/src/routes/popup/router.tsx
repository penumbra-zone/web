import { createHashRouter, RouteObject } from 'react-router-dom';
import { PopupIndex, popupIndexLoader } from './home';
import { Login, popupLoginLoader } from './login';
import { PopupPath } from './paths';
import { PopupLayout } from './popup-layout';
import { Settings } from './settings';
import { settingsRoutes } from './settings/routes';
import { TransactionApproval, transactionApprovalLoader } from './approval/transaction';
import { OriginApproval, originApprovalLoader } from './approval/origin';

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
        loader: popupLoginLoader,
      },
      {
        path: PopupPath.SETTINGS,
        element: <Settings />,
        children: settingsRoutes,
      },
      {
        path: PopupPath.TRANSACTION_APPROVAL,
        element: <TransactionApproval />,
        loader: transactionApprovalLoader,
      },
      {
        path: PopupPath.ORIGIN_APPROVAL,
        element: <OriginApproval />,
        loader: originApprovalLoader,
      },
    ],
  },
];

export const popupRouter = createHashRouter(popupRoutes);
