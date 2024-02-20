import { Outlet } from 'react-router-dom';

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
export const PopupLayout = () => (
  <div className='flex min-h-full flex-col bg-card-radial'>
    <Outlet />
  </div>
);
