import { createContext, useContext } from 'react';

export const CumulativeLayoutIdContext = createContext<string[]>([]);

export const useCumulativeLayoutId = (layoutId: string) => {
  const cumulativeLayoutId = useContext(CumulativeLayoutIdContext);
  return [...cumulativeLayoutId, layoutId].join('.');
};
