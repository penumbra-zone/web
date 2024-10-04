import { ReactNode } from 'react';
import '@/v2.css';
import { StyledComponentsRegistry } from './StyleRegistry';

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}

export default RootLayout;
