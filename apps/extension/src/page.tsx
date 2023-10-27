import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { pageRouter } from './routes/page/router';
import { StrictMode } from 'react';

import '@penumbra-zone/ui/styles/globals.css';

const initializePage = () => {
  const rootElement = document.getElementById('root') as HTMLDivElement;
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={pageRouter} />, //{' '}
    </StrictMode>,
  );
};

initializePage();
