import { ReactNode, useContext } from 'react';
import { CumulativeLayoutIdContext } from '.';

export const CumulativeLayoutIdProvider = ({
  layoutId,
  children,
}: {
  layoutId: string;
  children: ReactNode;
}) => {
  const cumulativeLayoutId = useContext(CumulativeLayoutIdContext);

  return (
    <CumulativeLayoutIdContext.Provider value={[...cumulativeLayoutId, layoutId]}>
      {children}
    </CumulativeLayoutIdContext.Provider>
  );
};
