import { Progress } from '@penumbra-zone/ui/Progress';
import { statusStore } from '@/shared/state/status';
import { observer } from 'mobx-react-lite';

export const SyncBar = observer(() => {
  const { loading, error, syncPercent, updating } = statusStore;

  return (
    <div className='fixed left-0 top-0 h-1 w-full'>
      {loading ? (
        <Progress value={0} loading error={Boolean(error)} />
      ) : (
        <Progress value={syncPercent} loading={updating} error={Boolean(error)} />
      )}
    </div>
  );
});
