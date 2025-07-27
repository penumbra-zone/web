import { BugIcon } from 'lucide-react';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';
import cn from 'clsx';

export interface EpochBugProps {
  epoch: number;
  small?: boolean;
}

/**
 * For several epochs, votes do not add up to 100% due to CLI feature that allows voting for any asset.
 */
export const EpochBug = ({ small, epoch }: EpochBugProps) => {
  if (epoch < 207 || epoch > 214) {
    return null;
  }

  return (
    <Tooltip message='During this epoch, a bug caused some votes to be mistakenly attributed to invalid assets. Represented votes may not amount to 100%'>
      <div
        className={cn(
          'flex cursor-pointer items-center justify-center rounded-full border border-other-tonal-stroke bg-transparent transition-colors hover:bg-action-hover-overlay',
          small ? 'size-6' : 'size-8',
        )}
      >
        <BugIcon className={cn(small ? 'size-3' : 'size-4')} />
      </div>
    </Tooltip>
  );
};
