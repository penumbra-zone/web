import React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from 'ui';
import 'ui/styles/globals.css';

const Popup = () => {
  return (
    <>
      <h1 className='bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-5xl font-extrabold text-transparent'>
        In popup
      </h1>
      <Button>Click me</Button>
      <ul style={{ minWidth: '700px' }}>
        <li>Current Time: {new Date().toLocaleTimeString()}</li>
      </ul>
    </>
  );
};

const startExtension = () => {
  const root = createRoot(document.getElementById('root') as HTMLDivElement);
  root.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>,
  );
};

startExtension();
