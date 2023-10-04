'use client';

import { Input, InputProps } from 'ui';
import { cn } from 'ui/lib/utils';
import { Validation } from '../types/utility';
import { useValidationResult } from '../hooks';

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
  const validationResult = useValidationResult(value, validations);

  return (
    <div
      className={cn(
        'bg-background px-4 pt-3 pb-4 rounded-lg border flex flex-col gap-1',
        validationResult?.type === 'error' && 'border-red-400',
        validationResult?.type === 'warn' && 'border-yellow-300',
        className,
      )}
    >
      <div className='flex items-center gap-2 self-start'>
        <p className='text-base font-bold'>{label}</p>
        {validationResult ? (
          <div className={cn('italic', 'text-red-400')}>{validationResult.issue}</div>
        ) : null}
      </div>
      <Input variant='transparent' placeholder={placeholder} value={value} {...props} />
    </div>
  );
};
