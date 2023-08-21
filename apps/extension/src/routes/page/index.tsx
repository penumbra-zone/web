import { redirect, useLocation } from 'react-router-dom';
import { PagePath } from './paths';
import { localExtStorage } from '../../storage/local';
import { Button } from 'ui/components';
import { usePageNav } from '../../utils/navigate';

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts in the loader.
// Will redirect to onboarding if necessary.
export const pageIndexLoader = async () => {
  const accounts = await localExtStorage.get('accounts');
  return !accounts.length ? redirect(PagePath.WELCOME) : null;
};

export const PageIndex = () => {
  const navigate = usePageNav();
  const a = useLocation();
  console.log(a);

  return (
    <div>
      Dashboard page
      <Button onClick={() => navigate(PagePath.WELCOME)}>Go to onboarding</Button>
    </div>
  );
};
