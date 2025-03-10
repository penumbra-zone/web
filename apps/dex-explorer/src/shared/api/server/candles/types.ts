import { CandleWithVolume } from './utils';

export type CandleApiResponse = CandleWithVolume[] | { error: string };

export interface DbCandle {
  close: number;
  direct_volume: number;
  high: number;
  low: number;
  open: number;
  swap_volume: number;
  start_time: Date;
}
