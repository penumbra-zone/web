'use client';

import Waves from './penumbra-waves.svg';
import cn from 'clsx';

export const PenumbraWaves = () => {
  return (
    <Waves
      className={cn(
        'w-screen h-[100vw] fixed top-0 left-0 -z-1 -translate-y-[70%] scale-150 pointer-events-none',
        'desktop:scale-100 desktop:w-[80vw] desktop:h-[80vw] desktop:-translate-y-3/4 desktop:left-[10vw]',
      )}
    />
  );
};
