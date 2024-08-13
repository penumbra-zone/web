import { createRoot } from 'react-dom/client';
import { PenumbraUIProvider } from '@repo/ui/PenumbraUIProvider';
import { App } from './app';

import '@repo/ui/styles/globals.css';
import './global.css';

const Main = () => {
  return (
      <PenumbraUIProvider>
        <App />
      </PenumbraUIProvider>
  );
};

const rootElement = document.getElementById('root') as HTMLDivElement;
createRoot(rootElement).render(<Main />);
