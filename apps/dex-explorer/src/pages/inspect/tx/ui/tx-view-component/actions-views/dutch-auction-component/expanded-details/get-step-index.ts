import { DutchAuctionDescription } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';

/**
 * A step index can't be below 0 or after the full step count, so we'll clamp
 * the step index to the step count.
 */
const clampBetweenZeroAnd = (max: bigint, value: bigint) =>
  // eslint-disable-next-line no-nested-ternary -- readable ternary
  value > max ? max : value < 0n ? 0n : value;

export const getStepIndex = (
  {
    startHeight,
    endHeight,
    stepCount,
  }: Pick<DutchAuctionDescription, 'startHeight' | 'endHeight' | 'stepCount'>,
  fullSyncHeight?: bigint,
): bigint | undefined => {
  if (fullSyncHeight === undefined) {
    return undefined;
  }
  if (fullSyncHeight >= endHeight) {
    return stepCount - 1n;
  } // zero-indexed
  if (fullSyncHeight <= startHeight) {
    return 0n;
  }

  const currentDistanceFromStartHeight = fullSyncHeight - startHeight;
  const endHeightDistanceFromStartHeightInclusive = endHeight - startHeight + 1n;
  const stepSize = endHeightDistanceFromStartHeightInclusive / stepCount;
  const stepIndex = currentDistanceFromStartHeight / stepSize;

  return clampBetweenZeroAnd(stepCount, stepIndex);
};
