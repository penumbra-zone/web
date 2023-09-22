import 'ui/styles/globals.css';
import React, { ReactNode } from 'react';
import Providers from './providers';
import { Header } from './header';
import Image from 'next/image';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <Providers>
          <Image
            src='/penumbra-logo.svg'
            width={234}
            height={234}
            alt='Penumbra logo'
            className='absolute -top-[140px] -left-[100px] rotate-[320deg]'
          />
          <div className='relative flex min-h-screen flex-col'>
            <Header />
            <main className='flex-1 mt-[68px]'>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
