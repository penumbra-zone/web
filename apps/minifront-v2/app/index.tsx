import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import '@penumbra-zone/ui/style.css';

import { queryClient } from '@shared/const/query-client';
import { router } from './router';

const Main = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

const rootElement = document.getElementById('root') as HTMLDivElement;
createRoot(rootElement).render(<Main />);
