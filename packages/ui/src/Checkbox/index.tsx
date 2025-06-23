import { Root, CheckboxIndicator } from '@radix-ui/react-checkbox';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { ReactNode } from 'react';
import cn from 'clsx';
import { Text } from '../Text';

export type CheckedState = boolean | 'indeterminate';

export interface CheckboxProps {
  title?: ReactNode;
  description?: ReactNode;
  /** A boolean or 'indeterminate' string */
  checked: CheckedState;
  onChange?: (checked: CheckedState) => void;
  defaultChecked?: CheckedState;
  required?: boolean;
  disabled?: boolean;
}

export const Checkbox = ({
  checked,
  onChange,
  required,
  disabled,
  defaultChecked,
  title,
  description,
}: CheckboxProps) => {
  return (
    <label className={cn('flex gap-3 items-start')}>
      <Root
        checked={checked}
        required={required}
        disabled={disabled}
        onCheckedChange={onChange}
        defaultChecked={defaultChecked}
        className={cn(
          'relative flex size-5 appearance-none items-center justify-center rounded-xs',
          'outline-solid outline-[1.5px]  outline-other-tonal-stroke bg-transparent transition-[background-color,outline-color]',
          'focus:outline-action-primary-focus-outline aria-checked:bg-primary-main data-[state=indeterminate]:bg-neutral-main data-[state=indeterminate]:outline-other-neutral-outline aria-checked:outline-other-orange-outline aria-checked:focus:outline-action-primary-focus-outline',
          'before:content-[""] before:size-[23px] before:absolute before:top-1/2 before:left-1/2 before:-translate-y-1/2 before:-translate-x-1/2 before:rounded-xs before:z-1',
          'before:transition-colors hover:before:bg-action-hover-overlay disabled:before:bg-action-disabled-overlay',
        )}
      >
        <CheckboxIndicator>
          {checked === 'indeterminate' && <MinusIcon className='size-4 text-neutral-contrast' />}
          {checked === true && <CheckIcon className='size-4 text-neutral-contrast' />}
        </CheckboxIndicator>
      </Root>

      {(title ?? description) && (
        <div className='flex grow flex-col gap-1'>
          {typeof title === 'string' ? (
            <Text small color='text.primary'>
              {title}
            </Text>
          ) : (
            title
          )}

          {typeof description === 'string' ? (
            <Text detail color='text.secondary'>
              {description}
            </Text>
          ) : (
            description
          )}
        </div>
      )}
    </label>
  );
};
