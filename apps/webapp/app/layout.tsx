import 'ui/styles/globals.css';
import React, { ReactNode } from 'react';
import Providers from './providers';
import { Header } from './header/header';
import Image from 'next/image';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body className='bg-background text-muted'>
        <Providers>
          <Image
            src='/penumbra-logo.svg'
            width={234}
            height={234}
            alt='Penumbra logo'
            className='absolute left-[-100px] top-[-140px] rotate-[320deg]'
          />
          <div className='relative flex min-h-screen flex-col'>
            <Header />
            <main className='flex-1 pt-10'>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
