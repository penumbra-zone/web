import { Outlet } from 'react-router-dom';

export const PopupLayout = () => {
  return (
    <div className='relative flex flex-col bg-charcoal'>
      <div className='relative z-10'>
        <Outlet />
      </div>
      <div className='absolute inset-0 z-0 bg-card-radial opacity-20' />
    </div>
  );
};
