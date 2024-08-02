// Importing `./state` before any components ensures that `useStore` gets
// defined before any slices get used. Otherwise, we'll get an error like
// `Cannot access 'createXSlice' before initialization` due to circular
// references.
import './state';

import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { rootRouter } from './components/root-router';
import { PenumbraUIProvider } from '@repo/ui/PenumbraUIProvider';

const Main = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <PenumbraUIProvider>
        <RouterProvider router={rootRouter} />
      </PenumbraUIProvider>
    </QueryClientProvider>
  );
};

const rootElement = document.getElementById('root') as HTMLDivElement;
createRoot(rootElement).render(<Main />);
