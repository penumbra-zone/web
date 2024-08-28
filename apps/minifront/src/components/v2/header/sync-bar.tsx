import { statusSelector, useStatus } from '../../../state/status.ts';
import { Progress } from '@repo/ui/Progress';

export const SyncBar = () => {
  const status = useStatus({
    select: statusSelector,
  });

  return (
    <div className='fixed left-0 top-0 h-1 w-full'>
      {status?.isCatchingUp === undefined ? (
        <Progress value={0} loading />
      ) : (
        <Progress
          value={status.percentSyncedNumber}
          loading={status.isUpdating}
          error={Boolean(status.error)}
        />
      )}
    </div>
  );
};
