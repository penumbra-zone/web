import { forwardRef, ReactNode } from 'react';
import { small } from '../utils/typography';
import { ActionType, getFocusWithinOutlineColorByActionType } from '../utils/action-type';
import { useDisabled } from '../utils/disabled-context';
import cn from 'clsx';

export interface TextInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  actionType?: ActionType;
  disabled?: boolean;
  type?: 'email' | 'number' | 'password' | 'tel' | 'text' | 'url';
  /**
   * Markup to render inside the text input's visual frame, before the text
   * input itself.
   */
  startAdornment?: ReactNode;
  /**
   * Markup to render inside the text input's visual frame, after the text input
   * itself.
   */
  endAdornment?: ReactNode;
  max?: string | number;
  min?: string | number;
}

/**
 * A simple text field.
 *
 * Can be enriched with start and end adornments, which are markup that render
 * inside the text input's visual frame.
 */
// eslint-disable-next-line react/display-name -- exotic component
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      value,
      onChange,
      placeholder,
      actionType = 'default',
      disabled,
      type = 'text',
      startAdornment = null,
      endAdornment = null,
      max,
      min,
    }: TextInputProps,
    ref,
  ) => (
    <div
      className={cn(
        'flex items-center gap-2 bg-other-tonalFill5',
        startAdornment && 'pl-3',
        endAdornment && 'pr-3',
        'outline outline-2 outline-transparent',
        'hover:bg-action-hoverOverlay',
        'transition-[background-color,outline-color] duration-150',
        getFocusWithinOutlineColorByActionType(actionType),
      )}
    >
      {startAdornment}

      <input
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={useDisabled(disabled)}
        type={type}
        max={max}
        min={min}
        ref={ref}
        className={cn(
          'box-border grow appearance-none border-none bg-base-transparent py-2',
          startAdornment ? 'pl-0' : 'pl-3',
          endAdornment ? 'pr-0' : 'pr-3',
          disabled ? 'text-text-muted' : 'text-text-primary',
          small,
          'placeholder:text-text-secondary',
          'disabled:cursor-not-allowed',
          'disabled:placeholder:text-text-muted',
          'focus:outline-0',
          '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
        )}
      />

      {endAdornment}
    </div>
  ),
);
