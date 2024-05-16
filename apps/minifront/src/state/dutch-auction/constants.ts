const APPROX_BLOCK_DURATION_MS = 5_000n;
const MINUTE_MS = 60_000n;
export const BLOCKS_PER_MINUTE = MINUTE_MS / APPROX_BLOCK_DURATION_MS;
export const BLOCKS_PER_HOUR = BLOCKS_PER_MINUTE * 60n;

export const DURATION_OPTIONS = ['10min', '30min', '1h', '2h', '6h', '12h', '24h', '48h'] as const;
export type DurationOption = (typeof DURATION_OPTIONS)[number];

export const STEP_COUNT = 60n;

/**
 * When a user creates an auction in minifront, minifront actually creates a
 * series of "sub-auctions", rather than creating a single auction with the
 * entirety of the user's input funds. This minimizes the user's exposure to
 * price fluctuations. The user's input and output amounts are equally divided
 * into the number of sub-auctions, and the sub-auctions are spaced apart to
 * take up roughly the duration that the user specifies (although they're spaced
 * with some randomness to avoid having too many auctions on the same blocks).
 */
export interface GdaRecipe {
  /**
   * The target overall duration of _all_ sub-auctions, from the start height of
   * the first to the end height of the last.
   *
   * Note that the actual duration won't be exactly equal to this due to the
   * randomness of a Poisson distribution.
   */
  durationInBlocks: bigint;
  /** Used to generate the poisson distribution of sub-auctions. */
  poissonIntensityPerBlock: number;
  /** The number of sub-auctions for a given overall duration. */
  numberOfSubAuctions: bigint;
  /** The duration of each sub-auction for a given overall duration. */
  subAuctionDurationInBlocks: bigint;
}

/**
 * Configuration parameters for generating sub-auctions based on the user's
 * desired duration.
 */
export const GDA_RECIPES: Record<DurationOption, GdaRecipe> = {
  '10min': {
    durationInBlocks: 10n * BLOCKS_PER_MINUTE,
    poissonIntensityPerBlock: 0.064614,
    numberOfSubAuctions: 4n,
    subAuctionDurationInBlocks: 60n,
  },
  '30min': {
    durationInBlocks: 30n * BLOCKS_PER_MINUTE,
    poissonIntensityPerBlock: 0.050577,
    numberOfSubAuctions: 12n,
    subAuctionDurationInBlocks: 60n,
  },
  '1h': {
    durationInBlocks: BLOCKS_PER_HOUR,
    poissonIntensityPerBlock: 0.042122,
    numberOfSubAuctions: 12n,
    subAuctionDurationInBlocks: 120n,
  },
  '2h': {
    durationInBlocks: 2n * BLOCKS_PER_HOUR,
    poissonIntensityPerBlock: 0.022629,
    numberOfSubAuctions: 24n,
    subAuctionDurationInBlocks: 120n,
  },
  '6h': {
    durationInBlocks: 6n * BLOCKS_PER_HOUR,
    poissonIntensityPerBlock: 0.010741,
    numberOfSubAuctions: 36n,
    subAuctionDurationInBlocks: 240n,
  },
  '12h': {
    durationInBlocks: 12n * BLOCKS_PER_HOUR,
    poissonIntensityPerBlock: 0.00537,
    numberOfSubAuctions: 36n,
    subAuctionDurationInBlocks: 480n,
  },
  '24h': {
    durationInBlocks: 24n * BLOCKS_PER_HOUR,
    poissonIntensityPerBlock: 0.03469,
    numberOfSubAuctions: 48n,
    subAuctionDurationInBlocks: 720n,
  },
  '48h': {
    durationInBlocks: 48n * BLOCKS_PER_HOUR,
    poissonIntensityPerBlock: 0.00735,
    numberOfSubAuctions: 48n,
    subAuctionDurationInBlocks: 1440n,
  },
};
