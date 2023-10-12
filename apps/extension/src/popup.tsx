import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { popupRouter } from './routes/popup/router';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/clients';

import 'ui/styles/globals.css';

const startPopup = () => {
  const rootElement = document.getElementById('popup-root') as HTMLDivElement;
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={popupRouter} />
      </QueryClientProvider>
    </StrictMode>,
  );
};

startPopup();
