'use client';

import Waves from './penumbra-waves.svg';
import cn from 'clsx';

export const PenumbraWaves = () => {
  return (
    <Waves
      className={cn(
        'display-none absolute scale-90 w-[1200px] top-[-800px] left-[25%]  z-[-30] opacity-90',
      )}
    />
  );
};
