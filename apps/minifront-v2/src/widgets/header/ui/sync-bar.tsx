import { observer } from 'mobx-react-lite';
import { useStatusStore } from '@/shared/stores/store-context';

export const SyncBar = observer(() => {
  const statusStore = useStatusStore();
  const syncStatus = statusStore.syncStatus;

  if (!syncStatus?.syncHeight || !syncStatus?.latestKnownBlockHeight) {
    return null;
  }

  const progress = statusStore.syncProgress;
  const isSynced = statusStore.isSynced;

  if (isSynced) {
    return null;
  }

  return (
    <div className='fixed inset-x-0 top-0 z-50 h-1 bg-gray-200'>
      <div
        className='h-full bg-orange-400 transition-all duration-300'
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
});
