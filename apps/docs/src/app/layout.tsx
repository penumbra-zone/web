import '../styles/globals.css';
// include styles from the ui package
import 'ui/styles.css';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className='bg-zinc-900'>
      <body>{children}</body>
    </html>
  );
}
