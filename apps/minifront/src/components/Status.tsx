import { useEffect } from 'react';
import { useStore } from '../state';

/**
 * A component that simply keeps the Zustand state up to date with the latest
 * output of `viewClient.status()`.
 */
export const Status = () => {
  const start = useStore(state => state.status.start);

  useEffect(() => void start(), [start]);

  return null;
};
