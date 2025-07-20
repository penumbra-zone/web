import React, { ReactNode, useMemo } from 'react';
import cn from 'clsx';
import { RadioGroupItem } from '@radix-ui/react-radio-group';
import { Text } from '../Text';
import {
  ActionType,
  getAriaCheckedOutlineColorByActionType,
  getFocusOutlineColorByActionType,
} from '../utils/action-type';

export interface DialogRadioItemProps {
  /** A required unique string value defining the radio item */
  value: string;
  title: ReactNode;
  description?: ReactNode;
  /** A component rendered on the left side of the item */
  endAdornment?: ReactNode;
  /** A component rendered on the right side of the item */
  startAdornment?: ReactNode;
  disabled?: boolean;
  actionType?: ActionType;
  /** A function that closes the dialog on select of the item */
  onClose?: VoidFunction;
  /** Fires when the item is clicked or focused using the keyboard */
  onSelect?: VoidFunction;
}

/** A radio button that selects an asset or a balance from the `AssetSelector` */
export const RadioItem = ({
  value,
  title,
  description,
  startAdornment,
  endAdornment,
  disabled,
  actionType = 'default',
  onClose,
  onSelect,
}: DialogRadioItemProps) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Is a click and not an arrow key up/down
    if (event.detail > 0) {
      onSelect?.();
      onClose?.();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.();
      onClose?.();
    }
  };

  const descriptionText = useMemo(() => {
    if (!description) {
      return null;
    }

    if (typeof description === 'string') {
      return (
        <div className='truncate max-w-[50%]'>
          <Text detail color='text.secondary' as='div'>
            {description}
          </Text>
        </div>
      );
    }

    return description;
  }, [description]);

  return (
    <RadioGroupItem key={value} disabled={disabled} value={value} asChild>
      <button
        type='button'
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center justify-between text-left transition-all duration-150',
          'rounded-sm bg-other-tonal-fill5 p-3',
          'outline-2 outline-transparent outline-solid',
          'hover:bg-button-hover focus:bg-button-hover',
          'disabled:bg-button-disabled',
          getFocusOutlineColorByActionType(actionType),
          getAriaCheckedOutlineColorByActionType(actionType),
        )}
      >
        <div className='flex items-center gap-2'>
          {startAdornment}
          <div>
            <div className='flex items-center gap-1 whitespace-nowrap'>{title}</div>
            {descriptionText}
          </div>
        </div>

        {endAdornment}
      </button>
    </RadioGroupItem>
  );
};
