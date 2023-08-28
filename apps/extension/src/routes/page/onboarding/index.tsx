import { Outlet, redirect } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { localExtStorage } from '../../../storage/local';
import { sessionExtStorage } from '../../../storage/session';
import { PagePath } from '../paths';

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts in the loader.
// Will redirect to onboarding if necessary.
export const onboardingIndexLoader = async () => {
  const isInitialized = await localExtStorage.get('isInitialized');
  const password = await sessionExtStorage.get('hashedPassword');

  if (isInitialized && password) return redirect(PagePath.INDEX);

  if (isInitialized && !password) return redirect(PagePath.LOGIN);

  return null;
};

export const Onboarding = () => {
  return (
    <AnimatePresence>
      <Outlet />
    </AnimatePresence>
  );
};
