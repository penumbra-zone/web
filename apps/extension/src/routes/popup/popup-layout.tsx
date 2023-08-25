import { Outlet } from 'react-router-dom';
import { passwordSelector } from '../../state/password';
import { useStore } from '../../state';
import { useEffect } from 'react';
import { usePopupNav } from '../../utils/navigate';
import { PopupPath } from './paths';

export const PopupLayout = () => {
  const navigate = usePopupNav();
  const { hashedPassword } = useStore(passwordSelector);

  useEffect(() => {
    hashedPassword
      ? // password is in session, direct to index
        navigate(PopupPath.INDEX)
      : // session storage expired, needs to re-login
        navigate(PopupPath.LOGIN);
  }, [hashedPassword]);

  return (
    <div className='relative bg-charcoal'>
      <div className='relative z-10'>{<Outlet />}</div>
      <div className='absolute inset-0 z-0 rounded-2xl bg-card-radial p-6 opacity-20' />
    </div>
  );
};
