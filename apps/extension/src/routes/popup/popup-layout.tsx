import { Outlet } from 'react-router-dom';

export const PopupLayout = () => {
  return (
    <div className='relative bg-charcoal'>
      <div className='relative z-10'>{<Outlet />}</div>
      <div className='absolute inset-0 z-0 rounded-2xl bg-card-radial p-6 opacity-20' />
    </div>
  );
};
