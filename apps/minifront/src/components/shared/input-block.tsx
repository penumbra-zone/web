import { cn } from '@penumbra-zone/ui/utils';
import { Validation, validationResult } from './validation-result';
import { ReactNode } from 'react';

interface InputBlockProps {
  label: string;
  className?: string | undefined;
  validations?: Validation[] | undefined;
  value?: unknown;
  children: ReactNode;
}

export const InputBlock = ({ label, className, validations, value, children }: InputBlockProps) => {
  const vResult = typeof value === 'string' ? validationResult(value, validations) : undefined;

  return (
    <div
      className={cn(
        'bg-background px-4 pt-3 pb-4 rounded-lg border flex flex-col gap-1',
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
