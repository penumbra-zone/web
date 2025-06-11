import { observer } from 'mobx-react-lite';
import { useAppParametersStore } from '@/shared/stores/store-context';

export const SyncBar = observer(() => {
  const appParametersStore = useAppParametersStore();
  // @ts-expect-error status property access
  const status = appParametersStore.status as
    | { syncHeight?: number; latestKnownBlockHeight?: number }
    | undefined;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- status can be undefined despite type assertion
  if (!status?.syncHeight || !status?.latestKnownBlockHeight) {
    return null;
  }

  const progress = (status.syncHeight / status.latestKnownBlockHeight) * 100;
  const isSynced = progress >= 100;

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
