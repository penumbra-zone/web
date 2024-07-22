import type { FC, KeyboardEventHandler } from 'react';
import { Input, InputProps } from '@repo/ui/components/ui/input';
import { useWheelPrevent } from './use-wheel-prevent';

export interface NumberInputProps extends InputProps {
  /** If present, prevents users from entering the fractional number part longer than `maxExponent` */
  maxExponent?: number;
}

export const NumberInput: FC<NumberInputProps> = ({ maxExponent, ...props }) => {
  const inputRef = useWheelPrevent();

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = event => {
    if (maxExponent === 0 && (event.key === '.' || event.key === ',')) {
      event.preventDefault();
      return;
    }

    if (
      typeof maxExponent !== 'undefined' &&
      typeof props.value === 'string' &&
      !Number.isNaN(Number(event.key))
    ) {
      const fraction = `${props.value}${event.key}`.split('.')[1]?.length;
      if (fraction && fraction > maxExponent) {
        event.preventDefault();
        return;
      }
    }
    props.onKeyDown?.(event);
  };

  return <Input ref={inputRef} {...props} type='number' onKeyDown={onKeyDown} />;
};
