import { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import '@/v2.css';
import { App } from './app';

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang='en'>
      <body>
        <App>{children}</App>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
};

export default RootLayout;
