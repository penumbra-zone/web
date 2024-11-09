import * as ProgressPrimitive from '@radix-ui/react-progress';
import cn from 'clsx';

export const getIndicatorColor = (value: number, error: boolean): string => {
  if (error) {
    return cn('bg-destructive-light');
  }

  if (value === 1) {
    return cn('bg-secondary-light');
  }

  return cn('bg-caution-light');
};

export interface ProgressProps {
  /** Percentage value from 0 to 1 */
  value: number;
  /** Displays the skeleton-like moving shade */
  loading?: boolean;
  /** Renders red indicator while the progress continues */
  error?: boolean;
}

/**
 * Progress bar with loading and error states
 */
export const Progress = ({ value, loading, error = false }: ProgressProps) => (
  <ProgressPrimitive.Root
    value={value}
    max={1}
    className={cn(
      'relative w-full h-1 overflow-hidden transition-colors',
      error ? 'bg-destructive-light' : 'bg-other-tonalFill5',
    )}
  >
    <ProgressPrimitive.Indicator asChild>
      <div
        style={{ transform: `translateX(-${100 - value * 100}%)` }}
        className={cn(
          'h-full w-full overflow-hidden',
          '[transition:background-color_.15s,transform_.5s_cubic-bezier(0.65,0,0.35,1)]',
          getIndicatorColor(value, error),
        )}
      >
        {loading && (
          <div
            className={cn(
              'absolute top-0 -left-[20%] w-1/5 h-full blur-[2px]',
              'animate-progress bg-progressLoading',
            )}
          />
        )}
      </div>
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
);
