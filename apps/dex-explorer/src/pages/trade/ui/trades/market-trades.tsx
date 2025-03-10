import { useRecentExecutions } from '../../api/recent-executions.ts';
import { TradesTable } from '@/pages/trade/ui/trades/table';

export const MarketTrades = () => {
  const { data, isLoading, error } = useRecentExecutions();

  return <TradesTable error={error} isLoading={isLoading} data={data} />;
};
