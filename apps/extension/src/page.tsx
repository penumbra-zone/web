import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import 'ui/styles/globals.css';
import { pageRouter } from './routes/page/router';

const initializePage = () => {
  const rootElement = document.getElementById('root') as HTMLDivElement;
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={pageRouter} />
    </StrictMode>,
  );
};

initializePage();
