import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { popupRouter } from './routes/popup/router';
import { RouterProvider } from 'react-router-dom';

import 'ui/styles/globals.css';

const startExtension = () => {
  const rootElement = document.getElementById('popup-root') as HTMLDivElement;
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={popupRouter} />
    </StrictMode>,
  );
};

startExtension();
