import { Outlet } from 'react-router-dom';
import { useStore } from '../../state';
import { passwordSelector } from '../../state/password';
import { useEffect } from 'react';
import { PagePath } from './paths';
import { usePageNav } from '../../utils/navigate';
import { accountsSelector } from '../../state/accounts';

const getLocationHash = (location: string, key: PagePath) =>
  (location.replace('#', '') as PagePath) === key;

export const PageLayout = () => {
  const navigate = usePageNav();
  const { hashedPassword } = useStore(passwordSelector);
  const { all } = useStore(accountsSelector);

  useEffect(() => {
    // redirect to reset wallet after popup forgot password click
    if (getLocationHash(window.location.hash, PagePath.RESTORE_PASSWORD))
      navigate(PagePath.RESTORE_PASSWORD);
  }, []);

  useEffect(() => {
    if (getLocationHash(window.location.hash, PagePath.RESTORE_PASSWORD)) return;

    // redirect to welcome if account didn`t create
    if (!all.length) {
      navigate(PagePath.WELCOME);
      return;
    }

    hashedPassword
      ? // redirect to index after login from other tabs or popup
        navigate(PagePath.INDEX)
      : // redirect to login after logout from other tabs or popup
        navigate(PagePath.LOGIN);
  }, [hashedPassword, all.length]);

  return <Outlet />;
};
