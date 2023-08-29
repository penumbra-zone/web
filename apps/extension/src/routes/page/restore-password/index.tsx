import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

export const RestorePasswordIndex = () => {
  return (
    <AnimatePresence>
      <Outlet />
    </AnimatePresence>
  );
};
