import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './components/router';

import '@repo/ui/styles/globals.css';

const rootElement = document.getElementById('root') as HTMLDivElement;
createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
