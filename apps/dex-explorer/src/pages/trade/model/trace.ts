import { Trace } from '@/shared/api/server/book/types.ts';
import { round } from '@/shared/utils/numbers/round.ts';

export const calculateSpread = (sellOrders: Trace[], buyOrders: Trace[]) => {
  if (!sellOrders.length || !buyOrders.length) {
    return;
  }

  const lowestSell = sellOrders[sellOrders.length - 1];
  const highestBuy = buyOrders[0];

  if (lowestSell === undefined || highestBuy === undefined) {
    return;
  }

  const sellPrice = parseFloat(lowestSell.price);
  const buyPrice = parseFloat(highestBuy.price);

  const spread = sellPrice - buyPrice;
  const midPrice = (sellPrice + buyPrice) / 2;
  const spreadPercentage = (spread / midPrice) * 100;

  return {
    amount: round(spread, 8),
    percentage: round(spreadPercentage, 2),
    midPrice: round(midPrice, 8),
  };
};
