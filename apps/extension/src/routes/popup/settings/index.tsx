import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

export const Settings = () => {
  return (
    <AnimatePresence>
      <Outlet />
    </AnimatePresence>
  );
};
