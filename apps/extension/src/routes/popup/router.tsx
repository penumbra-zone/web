import { createMemoryRouter, Outlet, RouteObject } from 'react-router-dom';
import { PopupPath } from './paths';
import { PopupIndex, popupIndexLoader } from './index';
import { EnterPassword } from './enter-password';

export const popupRoutes: RouteObject[] = [
  {
    element: <Outlet />,
    children: [
      {
        path: PopupPath.INDEX,
        element: <PopupIndex />,
        loader: popupIndexLoader,
      },
      {
        path: PopupPath.ENTER_PASSWORD,
        element: <EnterPassword />,
      },
    ],
  },
];

export const popupRouter = createMemoryRouter(popupRoutes);
