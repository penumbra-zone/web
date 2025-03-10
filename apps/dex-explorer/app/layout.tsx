import { ReactNode } from 'react';

import './v2.css';
import '@penumbra-zone/ui/style.css';

import { App } from './app';

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang='en'>
      <body>
        <App>{children}</App>
      </body>
    </html>
  );
};

export default RootLayout;
