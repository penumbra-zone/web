import { DependencyList, useEffect, useState } from 'react';

export const useWidth = (
  ref: React.RefObject<HTMLElement | null | undefined>,
  deps: DependencyList,
) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (ref.current) {
        requestAnimationFrame(() => {
          setWidth(ref.current?.offsetWidth ?? 0);
        });
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- spread deps into useEffect
  }, [ref, ...deps]);

  return width;
};
