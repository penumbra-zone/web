import { createMemoryRouter, RouteObject } from 'react-router-dom';
import { PopupIndex, popupIndexLoader } from './home';
import { Login } from './login';
import { Approval } from './approval';
import { PopupPath } from './paths';
import { PopupLayout } from './popup-layout';
import { Settings } from './settings';
import { settingsRoutes } from './settings/routes';

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
        path: PopupPath.APPROVAL,
        element: <Approval />,
      },
    ],
  },
];

export const popupRouter = createMemoryRouter(popupRoutes);
