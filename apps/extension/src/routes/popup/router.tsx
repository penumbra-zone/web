import { createMemoryRouter, Outlet, RouteObject } from 'react-router-dom';
import { popupPaths } from './paths';
import { PopupIndex } from './index';
import { EnterPassword } from './enter-password';

export const popupRoutes: RouteObject[] = [
  {
    element: <Outlet />,
    children: [
      {
        path: popupPaths.INDEX,
        element: <PopupIndex />,
      },
      {
        path: popupPaths.ENTER_PASSWORD,
        element: <EnterPassword />,
      },
    ],
  },
];

export const popupRouter = createMemoryRouter(popupRoutes);
