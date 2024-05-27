import { HeaderLink, headerLinks } from './constants';
import { Link } from 'react-router-dom';
import { usePagePath } from '../../fetchers/page-path';
import { AnimatePresence, motion } from 'framer-motion';
import { useId } from 'react';

const ActiveIndicator = ({ layoutId }: { layoutId: string }) => (
  <motion.div
    layout
    layoutId={layoutId}
    className='absolute inset-0 z-10 rounded-lg bg-button-gradient-secondary px-[30px] py-[10px]'
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  />
);

const isActive = (link: HeaderLink, pathname: HeaderLink['href']) =>
  link.href === pathname || link.subLinks?.includes(pathname);

export const Navbar = () => {
  const pathname = usePagePath();
  const layoutId = useId();

  return (
    <nav className='hidden max-w-xl gap-4 xl:flex xl:grow xl:justify-between'>
      {headerLinks.map(link =>
        link.active ? (
          <Link
            key={link.href}
            to={link.href}
            className='relative select-none rounded-lg px-[30px] py-[10px] font-bold'
          >
            <AnimatePresence>
              {isActive(link, pathname) && <ActiveIndicator layoutId={layoutId} />}
            </AnimatePresence>

            <span className='absolute inset-0 z-20 px-[30px] py-[10px]'>{link.label}</span>

            {/* For layout's sake, since other elements are absolute-positioned: */}
            <span className='text-transparent'>{link.label}</span>
          </Link>
        ) : (
          <div
            key={link.href}
            className='cursor-not-allowed select-none rounded-lg px-[30px] py-[10px] font-bold text-gray-600'
          >
            {link.label}
          </div>
        ),
      )}
    </nav>
  );
};
