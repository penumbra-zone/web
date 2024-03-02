import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { popupRouter } from '../routes/popup/router';

import { isOriginApprovalRequest, isPopupRequest, isTxApprovalRequest } from '../message/popup';
import { useStore } from '../state';
import { originApprovalSelector } from '../state/origin-approval';
import { txApprovalSelector } from '../state/tx-approval';

import '@penumbra-zone/ui/styles/globals.css';

chrome.runtime.onMessage.addListener(
  (req: unknown, _: chrome.runtime.MessageSender, responder: (x: unknown) => void) => {
    if (isPopupRequest(req)) {
      try {
        if (isTxApprovalRequest(req))
          void txApprovalSelector(useStore.getState()).acceptRequest(req, responder);
        else if (isOriginApprovalRequest(req))
          originApprovalSelector(useStore.getState()).acceptRequest(req, responder);
        else throw new Error('Unknown popup request');
      } catch (e) {
        responder({
          type: req.type,
          error: String(e),
        });
      }
      return true; // instruct chrome runtime to wait for a response
    }
    return false; // instruct chrome runtime we will not respond
  },
);

const MainPopup = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={popupRouter} />
      </QueryClientProvider>
    </StrictMode>
  );
};

const rootElement = document.getElementById('popup-root') as HTMLDivElement;
createRoot(rootElement).render(<MainPopup />);
