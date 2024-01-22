import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { PopupPath } from './paths';
import { useMemo } from 'react';

/**
 * @todo: Fix the issue where the detached popup isn't sized correctly. This
 * happens because #popup-root is hard-coded to a 600px width, which _should_
 * only be used for the attached popup. But it's also used for the detached
 * popup, which means that resizing the detached popup doesn't result in the UI
 * resizing with it.
 *
 * This can be fixed by detecting whether we're in the attached or detached
 * routes here in `PopupLayout`, and using a different root class name for each,
 * then removing the hard-coded width from `globals.css`.
 */
export const PopupLayout = () => {
  const location = useLocation();

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
