import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { pageRouter } from '../../routes/page/router';
import { StrictMode } from 'react';

import { maybeStartRPC } from '../../launch-offscreen';

import '@penumbra-zone/ui/styles/globals.css';

void maybeStartRPC();

const MainPage = () => {
  return (
    <StrictMode>
      <RouterProvider router={pageRouter} />
    </StrictMode>
  );
};

const rootElement = document.getElementById('root') as HTMLDivElement;
createRoot(rootElement).render(<MainPage />);
