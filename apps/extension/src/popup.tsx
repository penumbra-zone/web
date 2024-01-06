import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { popupRouter } from './routes/popup/router';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import '@penumbra-zone/ui/styles/globals.css';

import { popupControlHandler } from './control/popup';

export const queryClient = new QueryClient();

chrome.runtime.onMessage.addListener(popupControlHandler);

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
