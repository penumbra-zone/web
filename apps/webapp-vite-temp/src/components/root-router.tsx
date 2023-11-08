import { createBrowserRouter, redirect } from 'react-router-dom';
import { PagePath } from './metadata/paths.ts';
import { Layout } from './layout.tsx';

export const rootRouter = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        loader: () => redirect(PagePath.DASHBOARD),
      },
      {
        path: PagePath.DASHBOARD,
        element: <div>hello world</div>,
        loader: () => {
          console.log('running DASHBOARD loader');
          return null;
        },
      },
    ],
  },
]);
