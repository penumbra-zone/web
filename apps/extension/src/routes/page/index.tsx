import { redirect, useNavigate } from 'react-router-dom';
import { Button } from 'ui';
import { PagePath } from './paths';
import { localExtStorage } from '../../storage/local';

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts in the loader.
// Will redirect to onboarding if necessary.
export const pageIndexLoader = async () => {
  const accounts = await localExtStorage.get('accounts');
  return !accounts.length ? redirect(PagePath.ONBOARDING) : null;
};

export const PageIndex = () => {
  const navigate = useNavigate();
  return (
    <div>
      Dashboard page
      <Button
        onClick={() => {
          navigate(PagePath.ONBOARDING);
        }}
      >
        Go to onboarding
      </Button>
    </div>
  );
};
