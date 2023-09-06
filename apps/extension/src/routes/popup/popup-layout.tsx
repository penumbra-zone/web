import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../../components';
import { PagePath } from '../page/paths';

export const PopupLayout = () => {
  const location = useLocation();
  return (
    <div className='relative flex flex-col bg-charcoal'>
      <div className='relative z-10'>
        {(location.pathname as PagePath) === PagePath.INDEX && <Header />}
        <Outlet />
      </div>
      <div className='absolute inset-0 z-0 rounded-2xl bg-card-radial opacity-20' />
    </div>
  );
};
