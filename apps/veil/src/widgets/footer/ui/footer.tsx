'use client';

import { VeilVersion } from './veil-version';
import { useBasePath, PagePath } from '@/shared/const/pages';

export const Footer = () => {
  const currentPath = useBasePath();
  const isInspectPage = currentPath === PagePath.Inspect;

  if (!isInspectPage) {
    return null;
  }

  return (
    <footer className='mt-auto border-t border-t-other-solid-stroke px-6 py-4'>
      <div className='flex justify-center'>
        <VeilVersion />
      </div>
    </footer>
  );
};
