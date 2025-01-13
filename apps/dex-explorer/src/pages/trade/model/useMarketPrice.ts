import { useSummary } from '../api/use-summary';

export const useMarketPrice = (baseSymbol?: string, quoteSymbol?: string) => {
  const { data: summary } = useSummary('1d', baseSymbol, quoteSymbol);
  if (!summary || 'noData' in summary) {
    return undefined;
  }
  return summary.price;
};
