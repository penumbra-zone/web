import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { usePopupNav } from '../../utils/navigate';
import { PopupPath } from './paths';
import { useStore } from '../../state';
import { passwordSelector } from '../../state/password';

export const PopupRoot = () => {
  const navigate = usePopupNav();
  const { hashedPassword } = useStore(passwordSelector);

  useEffect(() => {
    // redirect to login page after logout
    if (!hashedPassword) navigate(PopupPath.ENTER_PASSWORD);
  }, [hashedPassword]);

  return <Outlet />;
};
