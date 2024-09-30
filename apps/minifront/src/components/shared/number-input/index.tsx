import type { FC } from 'react';
import { Input, InputProps } from '@penumbra-zone/ui/components/ui/input';
import { useWheelPrevent } from './use-wheel-prevent';

export const NumberInput: FC<InputProps> = props => {
  const inputRef = useWheelPrevent();

  return <Input ref={inputRef} {...props} type='number' />;
};
