import { createBrowserRouter } from 'react-router-dom';

import { Layout } from './layout.tsx';

export const rootRouter = createBrowserRouter([
  {
    path: '/',
    loader: () => ({ message: 'Hello Data Router!' }),
    element: <Layout />,
    children: [
      {
        path: 'hello',
        element: <div>hello world</div>,
      },
    ],
  },
]);
