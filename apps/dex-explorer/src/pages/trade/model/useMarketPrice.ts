import { useSummary } from './useSummary';

export const useMarketPrice = () => {
  const { data: summary } = useSummary('1d');
  if (!summary || 'noData' in summary) {
    return undefined;
  }
  return summary.price;
};
