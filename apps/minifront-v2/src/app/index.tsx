import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { TooltipProvider } from '@penumbra-zone/ui/Tooltip';
import { ToastProvider } from '@penumbra-zone/ui/Toast';
import { router } from './router';
import { StoreProvider, useRootStore } from '../shared/stores/store-context';

import '@penumbra-zone/ui/style.css';
import '@penumbra-zone/ui/theme.css';
import './global.css';

// Component to initialize stores
const StoreInitializer = ({ children }: { children: React.ReactNode }) => {
  const rootStore = useRootStore();

  useEffect(() => {
    // Initialize all stores when the app starts
    rootStore.initialize().catch((error: unknown) => {
      console.error(error);
    });

    // Cleanup function to dispose stores when app unmounts
    return () => {
      rootStore.dispose();
    };
  }, [rootStore]);

  return <>{children}</>;
};

const Main = () => {
  return (
    <StoreProvider>
      <TooltipProvider delayDuration={0}>
        <StoreInitializer>
          <main className='z-0'>
            <RouterProvider router={router} />
          </main>
          <div className='absolute bottom-0 right-0 z-10'>
            <ToastProvider />
          </div>
        </StoreInitializer>
      </TooltipProvider>
    </StoreProvider>
  );
};

const rootElement = document.getElementById('root') as HTMLDivElement;
createRoot(rootElement).render(<Main />);
