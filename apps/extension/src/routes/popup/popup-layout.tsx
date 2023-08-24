import { Outlet } from 'react-router-dom';

export const PopupLayout = () => {
  return (
    <div className='bg-charcoal relative'>
      <div className='relative z-10'>{<Outlet />}</div>
      <div className='bg-card-radial absolute inset-0 z-0 rounded-2xl p-6 opacity-20' />
    </div>
  );
};
