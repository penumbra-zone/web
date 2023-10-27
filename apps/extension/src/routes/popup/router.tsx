import { NotificationPath } from '@penumbra-zone/types';
import { createHashRouter, RouteObject } from 'react-router-dom';
import { ConnectSite, popupConnectSiteLoader } from './connect-site';
import { PopupIndex, popupIndexLoader } from './home';
import { Login } from './login';
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
        path: NotificationPath.CONNECT_SITE,
        element: <ConnectSite />,
        loader: popupConnectSiteLoader,
      },
    ],
  },
];

export const popupRouter = createHashRouter(popupRoutes);
