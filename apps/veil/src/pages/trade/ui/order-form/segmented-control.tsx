import React from 'react';
import cn from 'clsx';

export const SegmentedControl: React.FC<{
  direction: 'buy' | 'sell';
  setDirection: (direction: 'buy' | 'sell') => void;
}> = ({ direction, setDirection }) => {
  return (
    <div className='flex w-full h-8 mb-4'>
      <button
        className={cn(
          'flex-1 border transition-colors duration-300 rounded-l-2xl focus:outline-hidden',
          'border-r-0 border-other-tonal-stroke',
          direction === 'buy'
            ? 'bg-success-main border-success-main text-text-primary'
            : 'bg-transparent text-text-secondary',
        )}
        onClick={() => setDirection('buy')}
      >
        Buy
      </button>
      <button
        className={cn(
          'flex-1 border transition-colors duration-300 rounded-r-2xl focus:outline-hidden',
          'border-l-0 border-other-tonal-stroke',
          direction === 'sell'
            ? 'bg-destructive-main border-destructive-main text-text-primary'
            : 'bg-transparent text-text-secondary',
        )}
        onClick={() => setDirection('sell')}
      >
        Sell
      </button>
    </div>
  );
};
