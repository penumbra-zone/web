import {
  statusStreamStateSelector,
  syncPercentSelector,
  useStatus,
} from '../../../minifront/src/state/status.ts';
import { Progress } from '../../../../packages/ui-deprecated/src/Progress';
import { useStore } from '../../../minifront/src/state';

export const SyncBar = () => {
  const sync = useStatus({ select: syncPercentSelector });
  const { error: streamError } = useStore(statusStreamStateSelector);

  return (
    <div className='fixed left-0 top-0 h-1 w-full'>
      {sync?.percentSyncedNumber !== undefined ? (
        <Progress value={sync.percentSyncedNumber} />
      ) : (
        <Progress value={0} loading={sync?.loading} error={Boolean(streamError)} />
      )}
    </div>
  );
};
