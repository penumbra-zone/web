import { Input, InputProps } from '@repo/ui/components/ui/input';
import { useWheelPrevent } from './use-wheel-prevent';

export const NumberInput = (props: InputProps) => {
  const inputRef = useWheelPrevent();

  return <Input ref={inputRef} type='number' {...props} />;
};
