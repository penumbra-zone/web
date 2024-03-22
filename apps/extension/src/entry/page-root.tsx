import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { pageRouter } from '../routes/page/router';
import { StrictMode } from 'react';

import { ThemeProvider, useTheme } from '@interchain-ui/react';
import '@interchain-ui/react/styles';

import '@penumbra-zone/ui/styles/globals.css';

const MainPage = () => {
  const { theme, themeClass, setTheme } = useTheme();
  console.log('interchain theme', { theme, themeClass, setTheme });
  return (
    <ThemeProvider>
      <div className={themeClass}>
        <StrictMode>
          <RouterProvider router={pageRouter} />
        </StrictMode>
      </div>
    </ThemeProvider>
  );
};

const rootElement = document.getElementById('root') as HTMLDivElement;
createRoot(rootElement).render(<MainPage />);
