import { Input, InputProps } from '@penumbra-zone/ui';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { Validation, validationResult } from './validation-result.ts';

interface InputBlockProps extends InputProps {
  label: string;
  className?: string;
  validations?: Validation[];
  value: string;
}

export const InputBlock = ({
  label,
  placeholder,
  className,
  validations,
  value,
  ...props
}: InputBlockProps) => {
  const vResult = validationResult(value, validations);

  return (
    <div
      className={cn(
        'bg-background px-4 pt-3 pb-4 rounded-lg border flex flex-col gap-1',
        vResult?.type === 'error' && 'border-red-400',
        vResult?.type === 'warn' && 'border-yellow-300',
        className,
      )}
    >
      <div className='flex items-center gap-2 self-start'>
        <p className='text-base font-bold'>{label}</p>
        {vResult ? <div className={cn('italic', 'text-red-400')}>{vResult.issue}</div> : null}
      </div>
      <Input variant='transparent' placeholder={placeholder} value={value} {...props} />
    </div>
  );
};
