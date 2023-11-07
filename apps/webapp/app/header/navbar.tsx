'use client';

import { cn } from '@penumbra-zone/ui/lib/utils';
import Link from 'next/link';
import { useTypedPathname } from '../../hooks/typed-pathname';
import { headerLinks } from './constants';
import { DappPath } from '../../shared/header/types';

export const Navbar = () => {
  const pathname = useTypedPathname<DappPath>();

  return (
    <nav className='hidden gap-4 xl:flex'>
      {headerLinks.map(link =>
        link.active ? (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'font-bold py-[10px] px-[30px] select-none',
              link.subLinks &&
                link.subLinks.includes(pathname) &&
                'bg-button-gradient-secondary rounded-lg',
            )}
          >
            {link.label}
          </Link>
        ) : (
          <div
            key={link.href}
            className='cursor-not-allowed select-none px-[30px] py-[10px] font-bold text-gray-600'
          >
            {link.label}
          </div>
        ),
      )}
    </nav>
  );
};
