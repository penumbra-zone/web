import { round } from './round';

/**
 * Makes large numbers shorter. Examples:
 * - 999 -> 999
 * - 1_000 -> 1K
 * - 1_000_000 -> 1M
 * - 1_000_000_000 -> 1B
 * - 1_000_000_000_000 -> 1T
 */
export const shortify = (value: number): string => {
  if (value < 1_000) {
    return round(value, 0);
  }

  if (value < 1_000_000) {
    return `${round(value / 1_000, 1)}K`;
  }

  if (value < 1_000_000_000) {
    return `${round(value / 1_000_000, 1)}M`;
  }

  if (value < 1_000_000_000_000) {
    return `${round(value / 1_000_000_000, 1)}B`;
  }

  return `${round(value / 1_000_000_000_000, 1)}T`;
};
