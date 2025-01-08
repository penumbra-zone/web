import { useSummary } from './useSummary';

export const useMarketPrice = (baseSymbol?: string, quoteSymbol?: string) => {
  const { data: summary } = useSummary('1d', baseSymbol, quoteSymbol);
  if (!summary || 'noData' in summary) {
    return undefined;
  }
  return summary.price;
};
