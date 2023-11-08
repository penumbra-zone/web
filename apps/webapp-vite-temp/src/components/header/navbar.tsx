import { cn } from '@penumbra-zone/ui/lib/utils';
import { headerLinks } from './constants';
import { Link, useLocation } from 'react-router-dom';
import { PagePath } from '../metadata/paths.ts';

export const Navbar = () => {
  const location = useLocation();
  const pathname = location.pathname as PagePath;

  return (
    <nav className='hidden gap-4 xl:flex'>
      {headerLinks.map(link =>
        link.active ? (
          <Link
            key={link.href}
            to={link.href}
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
