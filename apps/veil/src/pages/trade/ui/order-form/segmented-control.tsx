import React from 'react';
import cn from 'clsx';

export const SegmentedControl: React.FC<{
  direction: 'buy' | 'sell';
  setDirection: (direction: 'buy' | 'sell') => void;
}> = ({ direction, setDirection }) => {
  return (
    <div className='mb-4 flex h-8 w-full'>
      <button
        className={cn(
          'flex-1 rounded-l-2xl border transition-colors duration-300 focus:outline-hidden',
          'border-r-0 border-other-tonal-stroke',
          direction === 'buy'
            ? 'border-success-main bg-success-main text-text-primary'
            : 'bg-transparent text-text-secondary',
        )}
        onClick={() => setDirection('buy')}
      >
        Buy
      </button>
      <button
        className={cn(
          'flex-1 rounded-r-2xl border transition-colors duration-300 focus:outline-hidden',
          'border-l-0 border-other-tonal-stroke',
          direction === 'sell'
            ? 'border-destructive-main bg-destructive-main text-text-primary'
            : 'bg-transparent text-text-secondary',
        )}
        onClick={() => setDirection('sell')}
      >
        Sell
      </button>
    </div>
  );
};
