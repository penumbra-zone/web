import { cn } from '@repo/ui/lib/utils';
import { Validation, validationResult } from './validation-result';
import { ReactNode } from 'react';
import { Box } from '@repo/ui/components/ui/box';

interface InputBlockProps {
  label: string;
  className?: string | undefined;
  validations?: Validation[] | undefined;
  value?: unknown;
  children: ReactNode;
  layout?: boolean;
  layoutId?: string;
}

export const InputBlock = ({
  label,
  className,
  validations,
  value,
  children,
  layout,
  layoutId,
}: InputBlockProps) => {
  const vResult = typeof value === 'string' ? validationResult(value, validations) : undefined;

  return (
    <Box
      label={label}
      headerContent={
        vResult ? <div className={cn('italic', 'text-red-400')}>{vResult.issue}</div> : null
      }
      layout={layout}
      layoutId={layoutId}
    >
      <div
        className={cn(
          'flex flex-col gap-1',
          vResult?.type === 'error' && 'border-red-400',
          vResult?.type === 'warn' && 'border-yellow-300',
          className,
        )}
      >
        {children}
      </div>
    </Box>
  );
};
