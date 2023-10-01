import { Outlet, useLocation } from 'react-router-dom';
import { cn } from 'ui/lib/utils';
import { PopupPath } from './paths';
import { useMemo } from 'react';

export const PopupLayout = () => {
  const location = useLocation();

  const isDarkBg = useMemo(() => {
    const pathname = location.pathname as PopupPath;
    return pathname === PopupPath.INDEX || pathname === PopupPath.LOGIN;
  }, [location]);

  return (
    <div
      className={cn(
        'relative flex flex-col h-full',
        isDarkBg ? 'bg-chachoal' : 'bg-charcoal-secondary',
      )}
    >
      <div className='relative z-10 h-full'>
        <Outlet />
      </div>
      <div className='absolute inset-0 z-0 bg-card-radial opacity-20' />
    </div>
  );
};
