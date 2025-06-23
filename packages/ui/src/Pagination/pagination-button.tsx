import cn from 'clsx';
import { useState, KeyboardEvent } from 'react';
import { Text } from '../Text';

export const ELLIPSIS_KEY = '...';

interface PaginationButtonProps {
  value: number | typeof ELLIPSIS_KEY;
  onClick: (value: number) => void;
  active?: boolean;
  disabled?: boolean;
}

export const PaginationButton = ({ value, onClick, active, disabled }: PaginationButtonProps) => {
  const [isInput, setIsInput] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const isEllipsis = value === ELLIPSIS_KEY;

  const handleClick = () => {
    if (isEllipsis) {
      setIsInput(true);
      return;
    }
    onClick(value);
  };

  const clearInput = () => {
    setInputValue('');
    setIsInput(false);
  };

  const setNewValue = () => {
    const newValue = parseInt(inputValue, 10);
    if (!isNaN(newValue)) {
      onClick(newValue);
    }
    clearInput();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setNewValue();
    } else if (event.key === 'Escape') {
      clearInput();
    }
  };

  let color = active
    ? cn('text-text-primary bg-other-tonalFill10')
    : cn('text-text-secondary hover:text-text-primary focus:text-text-primary');
  if (isEllipsis) {
    color = cn('text-text-muted');
  }

  if (isInput) {
    return (
      <input
        autoFocus
        type='number'
        value={inputValue}
        onBlur={setNewValue}
        onKeyDown={onKeyDown}
        onInput={event => setInputValue(event.currentTarget.value)}
        className={cn(
          'w-12 h-8 px-2 rounded-sm bg-other-tonalFill5 text-textSm font-normal',
          'transition-[background-color,outline-color] duration-150 outline outline-2 outline-transparent',
          'hover:bg-action-hoverOverlay focus:outline-action-neutralFocusOutline',
          '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          disabled ? 'text-text-muted' : 'text-text-primary',
        )}
      />
    );
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'size-8 min-w-8 rounded-full border-none transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-action-neutralFocusOutline',
        color,
      )}
    >
      <Text small>{value}</Text>
    </button>
  );
};
