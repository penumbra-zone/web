import { createHashRouter } from 'react-router-dom';
import { PortfolioPage } from '@pages/portfolio';

export const router = createHashRouter([
  {
    path: '/',
    element: <PortfolioPage />,
  },
]);
