'use client';

import { VeilVersion } from './veil-version';
import { useBasePath } from '@/shared/const/pages';
import { PagePath } from '@/shared/const/pages';

export const Footer = () => {
  const currentPath = useBasePath();
  const isInspectPage = currentPath === PagePath.Inspect;

  return (
    <footer className='mt-auto border-t border-t-other-solid-stroke px-6 py-4'>
      <div className='flex justify-center'>{isInspectPage && <VeilVersion />}</div>
    </footer>
  );
};
