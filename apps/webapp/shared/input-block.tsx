'use client';

import { useMemo } from 'react';
import { Input, InputProps } from 'ui';
import { cn } from 'ui/lib/utils';
import { Validation } from '../types/utillity';

interface InputBlockProps extends InputProps {
  label: string;
  className?: string;
  validations?: Validation[];
}

export const InputBlock = ({
  label,
  placeholder,
  className,
  validations,
  ...props
}: InputBlockProps) => {
  const priorityResult = useMemo(() => {
    if (!validations) return;
    const results = validations.filter(v => v.checkFn(props.value as string));
    const error = results.find(v => v.type === 'error');
    return error ? error : results.find(v => v.type === 'warn');
  }, [validations, props.value]);

  return (
    <div
      className={cn(
        'bg-background px-4 pt-3 pb-4 rounded-lg border flex flex-col gap-1',
        priorityResult?.type === 'error' && 'border-red-400',
        priorityResult?.type === 'warn' && 'border-yellow-300',
        className,
      )}
    >
      <div className='flex items-center gap-2 self-start'>
        <p className='text-base font-bold'>{label}</p>
        {priorityResult ? (
          <div className={cn('italic', 'text-red-400')}>{priorityResult.error}</div>
        ) : null}
      </div>
      <Input variant='transparent' placeholder={placeholder} {...props} />
    </div>
  );
};
