import React from 'react';
import { createRoot } from 'react-dom/client';
import 'ui/styles/globals.css';
import { Home } from './components/home';

const initializePage = () => {
  const root = createRoot(document.getElementById('root') as HTMLDivElement);
  root.render(
    <React.StrictMode>
      <Home />
    </React.StrictMode>,
  );
};

initializePage();
