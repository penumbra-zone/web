import { Outlet } from 'react-router-dom';
import { useStore } from '../../state';
import { passwordSelector } from '../../state/password';
import { useEffect } from 'react';
import { PagePath } from './paths';
import { usePageNav } from '../../utils/navigate';

export const PageLayout = () => {
  const navigate = usePageNav();
  const { hashedPassword } = useStore(passwordSelector);

  // TODO refactoring
  useEffect(() => {
    // redirect to reset wallet after popup forgot password click
    if ((window.location.hash.replace('#', '') as PagePath) === PagePath.RESTORE_PASSWORD) {
      navigate(PagePath.RESTORE_PASSWORD);
    }
  }, []);

  // TODO refactoring
  useEffect(() => {
    !((window.location.hash.replace('#', '') as PagePath) === PagePath.RESTORE_PASSWORD)
      ? hashedPassword
        ? navigate(PagePath.INDEX)
        : navigate(PagePath.LOGIN)
      : null;
  }, [hashedPassword]);

  return <Outlet />;
};
