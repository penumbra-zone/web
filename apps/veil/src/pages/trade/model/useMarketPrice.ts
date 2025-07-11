import { useBook } from '../api/book';
import { calculateSpread } from './trace';
import { usePathSymbols } from '@/pages/trade/model/use-path.ts';

export const useMarketPrice = (
  baseSymbol?: string,
  quoteSymbol?: string,
): { marketPrice: number | undefined; symbols: { base: string; quote: string } } => {
  const pathSymbols = usePathSymbols();
  const symbols = {
    base: baseSymbol ?? pathSymbols.baseSymbol,
    quote: quoteSymbol ?? pathSymbols.quoteSymbol,
  };

  const { data: book } = useBook(symbols.base, symbols.quote);
  if (!book?.multiHops) {
    return {
      marketPrice: undefined,
      symbols,
    };
  }

  const { buy: buyOrders, sell: sellOrders } = book.multiHops;

  // Calculate spread which includes the midprice
  const spreadInfo = calculateSpread(sellOrders, buyOrders);

  // Return the midprice from spread calculation
  const marketPrice = spreadInfo ? parseFloat(spreadInfo.midPrice) : undefined;

  return {
    marketPrice,
    symbols,
  };
};
