import React from 'react';
import { createRoot } from 'react-dom/client';
import 'ui/styles/globals.css';

const Page = () => {
  return (
    <>
      <h1 className='bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-5xl font-extrabold text-transparent'>
        Welcome to Penumbra
      </h1>
      <p>get started</p>
    </>
  );
};

// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>,
);
