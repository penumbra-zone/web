import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { PagePath } from './paths';
import { usePageNav } from '../../utils/navigate';
import { useStore } from '../../state';
import { passwordSelector } from '../../state/password';

export const PageRoot = () => {
  const navigate = usePageNav();
  const { hashedPassword } = useStore(passwordSelector);

  useEffect(() => {
    // redirect to login page after logout
    if (!hashedPassword) navigate(PagePath.INDEX);
  }, [hashedPassword]);

  useEffect(() => {
    // redirect to reset wallet after popup forgot password click
    if ((window.location.hash.replace('#', '') as PagePath) === PagePath.FORGOT_PASSWORD) {
      navigate(PagePath.FORGOT_PASSWORD);
    }
  }, []);
  return <Outlet />;
};
