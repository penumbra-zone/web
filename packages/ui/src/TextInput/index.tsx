import { HTMLAttributes, ReactNode } from 'react';
import { small } from '../utils/typography';
import { ActionType, getFocusWithinOutlineColorByActionType } from '../utils/action-type';
import { useDisabled } from '../utils/disabled-context';
import cn from 'clsx';
import { Text } from '../Text';
import { ThemeColor } from '../utils/color';

const getLabelColor = (actionType: ActionType, disabled?: boolean): ThemeColor => {
  if (disabled) {
    return 'text.muted';
  }
  if (actionType === 'destructive') {
    return 'destructive.light';
  }
  return 'text.secondary';
};

export interface TextInputProps
  extends Omit<HTMLAttributes<HTMLInputElement>, 'onChange' | 'className' | 'style'> {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  actionType?: ActionType;
  disabled?: boolean;
  label?: string;
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
export const TextInput = ({
  ref,
  label,
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
  ...rest
}: TextInputProps & {
  ref?: React.RefObject<HTMLInputElement>;
}) => (
  <label
    className={cn(
      'h-14 flex items-center gap-2 bg-other-tonalFill5 rounded-sm py-3 pl-3 pr-2 border-none',
      'cursor-text outline outline-2 outline-transparent',
      'hover:bg-action-hoverOverlay',
      'transition-[background-color,outline-color] duration-150',
      getFocusWithinOutlineColorByActionType(actionType),
    )}
  >
    {startAdornment && (
      <div
        className={cn(
          'flex items-center gap-2',
          disabled ? 'text-text-muted' : 'text-neutral-light',
        )}
      >
        {startAdornment}
      </div>
    )}
    {label && (
      <Text body color={getLabelColor(actionType, disabled)}>
        {label}
      </Text>
    )}
    <input
      {...rest}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={useDisabled(disabled)}
      type={type}
      max={max}
      min={min}
      ref={ref}
      className={cn(
        small,
        disabled ? 'text-text-muted' : 'text-text-primary',
        'box-border grow appearance-none border-none bg-base-transparent py-2',
        'placeholder:text-text-secondary',
        'disabled:cursor-not-allowed disabled:placeholder:text-text-muted',
        'focus:outline-0',
        '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
      )}
    />
    {endAdornment && (
      <div
        className={cn(
          'flex items-center gap-2',
          disabled ? 'text-text-muted' : 'text-neutral-light',
        )}
      >
        {endAdornment}
      </div>
    )}
  </label>
);
TextInput.displayName = 'TextInput';
