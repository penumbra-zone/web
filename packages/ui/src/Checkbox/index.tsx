import {
  Root,
  CheckboxIndicator,
  CheckboxProps as RadixCheckboxProps,
} from '@radix-ui/react-checkbox';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { ReactNode } from 'react';
import cn from 'clsx';
import { Text } from '../Text';

export interface CheckboxProps {
  title?: ReactNode;
  description?: ReactNode;
  checked: RadixCheckboxProps['checked'];
  onChange: RadixCheckboxProps['onCheckedChange'];
  defaultChecked?: RadixCheckboxProps['defaultChecked'];
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
          'outline outline-[1.5px]  outline-other-tonalStroke bg-transparent transition-[background-color,outline-color]',
          'focus:outline-action-primaryFocusOutline aria-checked:bg-primary-main data-[state=indeterminate]:bg-neutral-main data-[state=indeterminate]:outline-other-neutralOutline aria-checked:outline-other-orangeOutline aria-checked:focus:outline-action-primaryFocusOutline',
          'before:content-[""] before:size-[23px] before:absolute before:top-1/2 before:left-1/2 before:-translate-y-1/2 before:-translate-x-1/2 before:rounded-xs before:z-[1]',
          'before:transition-colors hover:before:bg-action-hoverOverlay disabled:before:bg-action-disabledOverlay',
        )}
      >
        <CheckboxIndicator>
          {checked === 'indeterminate' && <MinusIcon className='size-4 text-neutral-contrast' />}
          {checked === true && <CheckIcon className='size-4 text-neutral-contrast' />}
        </CheckboxIndicator>
      </Root>

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
    </label>
  );
};
