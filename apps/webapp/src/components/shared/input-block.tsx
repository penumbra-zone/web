import { cn } from '@penumbra-zone/ui/lib/utils';
import { Validation, validationResult } from './validation-result.ts';
import { ReactNode } from 'react';

interface InputBlockProps {
  label: string;
  className?: string;
  validations?: Validation[];
  value?: unknown;
  orientation?: 'horizontal' | 'vertical';
  children: ReactNode;
}

export const InputBlock = ({
  label,
  className,
  validations,
  value,
  orientation = 'vertical',
  children,
}: InputBlockProps) => {
  const vResult = typeof value === 'string' ? validationResult(value, validations) : undefined;

  return (
    <div
      className={cn(
        'bg-background px-4 rounded-lg border flex gap-1',
        orientation === 'horizontal'
          ? 'py-3 flex-row justify-between items-center'
          : 'flex-col pt-3 pb-4',
        vResult?.type === 'error' && 'border-red-400',
        vResult?.type === 'warn' && 'border-yellow-300',
        className,
      )}
    >
      <div className='flex items-center gap-2'>
        <p className='text-base font-bold'>{label}</p>
        {vResult ? <div className={cn('italic', 'text-red-400')}>{vResult.issue}</div> : null}
      </div>

      {children}
    </div>
  );
};
