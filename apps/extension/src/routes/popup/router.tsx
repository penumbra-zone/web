import { createMemoryRouter, Outlet, RouteObject } from 'react-router-dom';
import { popupPaths } from './paths';
import { PopupIndex } from './index';

export const popupRoutes: RouteObject[] = [
  {
    element: <Outlet />,

    children: [
      {
        path: popupPaths.INDEX,
        element: <PopupIndex />,
      },
    ],
  },
];

export const popupRouter = createMemoryRouter(popupRoutes);
