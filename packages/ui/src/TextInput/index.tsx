import { HTMLAttributes, ReactNode, Ref } from 'react';
import { small, body, large } from '../utils/typography';
import { ActionType, getFocusWithinOutlineColorByActionType } from '../utils/action-type';
import { useDisabled } from '../utils/disabled-context';
import cn from 'clsx';
import { Text } from '../Text';
import { ThemeColor } from '../utils/color';
import { Density } from '../utils/density';

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
  density?: Density;
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
  blurOnWheel?: boolean;
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
  density = 'sparse',
  ...rest
}: TextInputProps) => {
  let typographyCn = small;
  if (typography === 'large') {
    typographyCn = large;
  } else if (typography === 'body') {
    typographyCn = body;
  }

  return (
    <label
      className={cn(
        density === 'sparse' && 'h-14',
        density === 'compact' && 'h-11',
        density === 'slim' && 'h-8',
        'flex items-center gap-2 bg-other-tonalFill5 rounded-sm px-3 border-none',
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
};
TextInput.displayName = 'TextInput';
