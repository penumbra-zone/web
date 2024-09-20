import { ReactNode } from 'react';
import '@/v2.css';

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}

export default RootLayout;
