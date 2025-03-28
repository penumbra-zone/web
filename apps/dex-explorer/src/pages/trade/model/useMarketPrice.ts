import { useBook } from '../api/book';
import { calculateSpread } from './trace';

export const useMarketPrice = (baseSymbol?: string, quoteSymbol?: string) => {
  const { data: book } = useBook(baseSymbol, quoteSymbol);
  if (!book?.multiHops) {
    return undefined;
  }

  const { buy: buyOrders, sell: sellOrders } = book.multiHops;

  // Calculate spread which includes the midprice
  const spreadInfo = calculateSpread(sellOrders, buyOrders);

  // Return the midprice from spread calculation
  return spreadInfo ? parseFloat(spreadInfo.midPrice) : undefined;
};
