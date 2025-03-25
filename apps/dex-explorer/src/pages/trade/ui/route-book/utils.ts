import type { Trace } from '@/shared/api/server/book/types';

export const formatNumber = (value: string, totalDigits: number): string => {
  const num = parseFloat(value);
  const parts = num.toString().split('.');
  const whole = parts[0] ?? '0';
  const availableDecimals = Math.max(0, totalDigits - whole.length);
  return num.toFixed(availableDecimals);
};

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
