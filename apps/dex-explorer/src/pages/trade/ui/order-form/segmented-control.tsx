import React from 'react';
import { Direction } from './store';
import cn from 'clsx';

export const SegmentedControl: React.FC<{
  direction: Direction;
  setDirection: (direction: Direction) => void;
}> = ({ direction, setDirection }) => {
  return (
    <div className='flex w-full h-8 mb-4'>
      <button
        className={cn(
          'flex-1 border transition-colors duration-300 rounded-l-2xl focus:outline-none',
          'border-r-0 border-other-tonalStroke',
          direction === Direction.Buy
            ? 'bg-success-main border-success-main text-text-primary'
            : 'bg-transparent text-text-secondary',
        )}
        onClick={() => setDirection(Direction.Buy)}
      >
        Buy
      </button>
      <button
        className={cn(
          'flex-1 border transition-colors duration-300 rounded-r-2xl focus:outline-none',
          'border-l-0 border-other-tonalStroke',
          direction === Direction.Sell
            ? 'bg-destructive-main border-destructive-main text-text-primary'
            : 'bg-transparent text-text-secondary',
        )}
        onClick={() => setDirection(Direction.Sell)}
      >
        Sell
      </button>
    </div>
  );
};
