import { DependencyList, useEffect, useState } from 'react';

export const useWidth = (
  ref: React.RefObject<HTMLElement | null | undefined>,
  deps: DependencyList,
) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => {
      setWidth(ref.current?.offsetWidth ?? 0);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- spread deps into useEffect
  }, [ref, ...deps]);

  return width;
};
