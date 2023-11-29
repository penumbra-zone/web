import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { PopupPath } from './paths';
import { useEffect, useMemo } from 'react';
import { usePopupNav } from '../../utils/navigate';

export const PopupLayout = () => {
  const location = useLocation();

  // this is bad i hate this. what is the correct way to open a path
  const navigate = usePopupNav();
  console.log('popup layout', { location, navigate });
  useEffect(() => {
    if (window.location.hash && location.pathname === '/') {
      const hashPath = window.location.hash.slice(1) as PopupPath;
      navigate(hashPath);
    }
  }, [navigate]);

  const isDarkBg = useMemo(() => {
    const pathname = location.pathname as PopupPath;
    return pathname === PopupPath.INDEX || pathname === PopupPath.LOGIN;
  }, [location]);

  return (
    <div
      className={cn(
        'relative flex flex-col min-h-full',
        isDarkBg ? 'bg-chachoal' : 'bg-charcoal-secondary',
      )}
    >
      <div className='relative z-10'>
        <Outlet />
      </div>
      <div className='absolute inset-0 z-0 bg-card-radial opacity-20' />
    </div>
  );
};
