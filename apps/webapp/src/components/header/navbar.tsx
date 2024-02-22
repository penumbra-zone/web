import { cn } from '@penumbra-zone/ui/lib/utils';
import { headerLinks } from './constants';
import { Link } from 'react-router-dom';
import { usePagePath } from '../../fetchers/page-path';

export const Navbar = () => {
  const pathname = usePagePath();

  return (
    <nav className='hidden max-w-2xl gap-4 xl:flex xl:grow xl:justify-between'>
      {headerLinks.map(link =>
        link.active ? (
          <Link
            key={link.href}
            to={link.href}
            className={cn(
              'font-bold py-[10px] select-none',
              (link.href === pathname || link.subLinks?.includes(pathname)) &&
                'bg-button-gradient-secondary px-[30px] rounded-lg',
            )}
          >
            {link.label}
          </Link>
        ) : (
          <div
            key={link.href}
            className='cursor-not-allowed select-none py-[10px] font-bold text-gray-600'
          >
            {link.label}
          </div>
        ),
      )}
    </nav>
  );
};
