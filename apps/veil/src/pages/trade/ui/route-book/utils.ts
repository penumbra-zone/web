import type { Trace } from '@/shared/api/server/book/types';

export const calculateRelativeSizes = (orders: Trace[]): Map<string, number> => {
  if (!orders.length) {
    return new Map();
  }

  const totals = orders.map(order => parseFloat(order.total));
  const maxTotal = Math.max(...totals);

  return totals.reduce((map, total) => {
    const percentage = (total / maxTotal) * 100;
    map.set(total.toString(), percentage);
    return map;
  }, new Map<string, number>());
};
