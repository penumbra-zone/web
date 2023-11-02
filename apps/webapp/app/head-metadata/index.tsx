'use client';
import { usePathname } from 'next/navigation';
import { metadata } from './constants';

export const HeadMetadata = () => {
  const pathname = usePathname();

  return (
    <head>
      <title>{metadata[pathname]?.title ?? 'Penumbra'}</title>
      <meta name='description' content={metadata[pathname]?.description ?? ''} />
    </head>
  );
};
