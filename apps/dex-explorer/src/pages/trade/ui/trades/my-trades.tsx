import { observer } from 'mobx-react-lite';
import { connectionStore } from '@/shared/model/connection';
import { useLatestSwaps } from '../../api/latest-swaps';
import { TradesTable } from '@/pages/trade/ui/trades/table';
import { NotConnected } from './not-connected';

export const MyTrades = observer(() => {
  const { subaccount, connected } = connectionStore;
  const { data, isLoading, error } = useLatestSwaps(subaccount);

  if (!connected) {
    return <NotConnected />;
  }

  return <TradesTable error={error} isLoading={isLoading} data={data} />;
});
