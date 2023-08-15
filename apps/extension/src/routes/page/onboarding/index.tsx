import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

export const Onboarding = () => {
  return (
    <AnimatePresence>
      <Outlet />
    </AnimatePresence>
  );
};
