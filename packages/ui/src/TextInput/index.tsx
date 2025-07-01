import cn from 'clsx';
import { HTMLAttributes, ReactNode, Ref, KeyboardEvent } from 'react';
import { small, body, large } from '../utils/typography';
import { ActionType, getFocusWithinOutlineColorByActionType } from '../utils/action-type';
import { useDisabled } from '../utils/disabled-context';
import { Text } from '../Text';
import { ThemeColor } from '../utils/color';
import { useDensity } from '../utils/density';

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
  typography?: 'small' | 'body' | 'large';
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
  ref?: Ref<HTMLInputElement>;
  /**
   * Incase of type number, scrolling while the input is focused will change the
   * value. This prop will prevent that if set to true.
   */
  blurOnWheel?: boolean;
  /**
   * Prevent the input from entering more decimals than a given number.
   * Useful for entering amounts or prices of tokens.
   */
  maxDecimals?: number;
}

/**
 * A simple text field.
 *
 * Can be enriched with start and end adornments, which are markup that render
 * inside the text input's visual frame.
 */
export const TextInput = ({
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
  blurOnWheel = false,
  ref,
  typography = 'small',
  maxDecimals,
  ...rest
}: TextInputProps) => {
  const density = useDensity();

  let typographyCn = small;
  if (typography === 'large') {
    typographyCn = large;
  } else if (typography === 'body') {
    typographyCn = body;
  }

  // prevent input from exceeding the specified number of decimals
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const key = parseInt(event.key);
    const decimalPart = value?.split('.')[1] ?? '';
    if (!isNaN(key) && typeof maxDecimals !== 'undefined' && decimalPart.length >= maxDecimals) {
      event.preventDefault();
    }
  };

  return (
    <label
      className={cn(
        density === 'sparse' && 'h-14',
        density === 'compact' && 'h-11',
        density === 'slim' && 'h-8',
        'flex items-center gap-2 rounded-sm border-none bg-other-tonal-fill5 px-3',
        'cursor-text outline-2 outline-transparent outline-solid',
        'hover:bg-action-hover-overlay',
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
        onKeyDown={onKeyDown}
        onChange={e => onChange?.(e.target.value)}
        onWheel={
          blurOnWheel
            ? e => {
                // Remove focus to prevent scroll changes
                (e.target as HTMLInputElement).blur();
              }
            : undefined
        }
        placeholder={placeholder}
        disabled={useDisabled(disabled)}
        type={type}
        max={max}
        min={min}
        ref={ref}
        className={cn(
          typographyCn,
          disabled ? 'text-text-muted' : 'text-text-primary',
          'box-border w-full min-w-0 shrink grow appearance-none border-none bg-base-transparent py-2',
          'placeholder:text-text-secondary',
          'disabled:cursor-not-allowed disabled:placeholder:text-text-muted',
          'focus:outline-0',
          '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        )}
      />
      {endAdornment && (
        <div
          className={cn(
            'flex shrink-0 items-center gap-2',
            disabled ? 'text-text-muted' : 'text-neutral-light',
          )}
        >
          {endAdornment}
        </div>
      )}
    </label>
  );
};
TextInput.displayName = 'TextInput';
