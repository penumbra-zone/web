const APPROX_BLOCK_DURATION_MS = 5_000n;
const MINUTE_MS = 60_000n;
export const BLOCKS_PER_MINUTE = MINUTE_MS / APPROX_BLOCK_DURATION_MS;
export const BLOCKS_PER_HOUR = BLOCKS_PER_MINUTE * 60n;

export const DURATION_OPTIONS = ['10min', '30min', '1h', '2h', '6h', '12h', '24h', '48h'] as const;
export type DurationOption = (typeof DURATION_OPTIONS)[number];

export const STEP_COUNT = 60n;

export const DURATION_IN_BLOCKS: Record<DurationOption, bigint> = {
  '10min': 10n * BLOCKS_PER_MINUTE,
  '30min': 30n * BLOCKS_PER_MINUTE,
  '1h': BLOCKS_PER_HOUR,
  '2h': 2n * BLOCKS_PER_HOUR,
  '6h': 6n * BLOCKS_PER_HOUR,
  '12h': 12n * BLOCKS_PER_HOUR,
  '24h': 24n * BLOCKS_PER_HOUR,
  '48h': 48n * BLOCKS_PER_HOUR,
};
