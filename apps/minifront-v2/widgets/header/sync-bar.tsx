import { observer } from 'mobx-react-lite';
import { Progress } from '@penumbra-zone/ui/Progress';
import { useAppParametersStore } from '@shared/stores/store-context';

export const SyncBar = observer(() => {
  const appParametersStore = useAppParametersStore();
  const status = appParametersStore.status;

  const calculateSyncPercent = () => {
    if (!status?.syncHeight || !status?.latestKnownBlockHeight) {
      return 0;
    }
    return Math.min(status.syncHeight / status.latestKnownBlockHeight, 1) * 100;
  };

  return (
    <div className='fixed left-0 top-0 h-1 w-full'>
      <Progress value={calculateSyncPercent()} />
    </div>
  );
});
