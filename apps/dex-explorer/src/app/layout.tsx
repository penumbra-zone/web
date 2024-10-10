import { ReactNode } from 'react';
import '@/v2.css';
import { Providers } from './Providers';

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang='en'>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
