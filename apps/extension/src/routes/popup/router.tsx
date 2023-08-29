import { createMemoryRouter, RouteObject } from 'react-router-dom';
import { PopupIndex, popupIndexLoader } from './index';
import { Login } from './login';
import { PopupPath } from './paths';
import { PopupLayout } from './popup-layout';

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
    ],
  },
];

export const popupRouter = createMemoryRouter(popupRoutes);
