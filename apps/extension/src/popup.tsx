import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { popupRouter } from './routes/popup/router';
import { RouterProvider } from 'react-router-dom';
import { redirectIfNoAccount } from './utils/redirect';

import 'ui/styles/globals.css';

const startExtension = async () => {
  await redirectIfNoAccount();

  const rootElement = document.getElementById('root') as HTMLDivElement;
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={popupRouter} />
    </StrictMode>,
  );
};

void (async function () {
  await startExtension();
})();
