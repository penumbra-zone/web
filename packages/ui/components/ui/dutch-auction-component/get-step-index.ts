import { DutchAuctionDescription } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';

const clampBetweenZeroAnd = (max: bigint, value: bigint) =>
  value > max ? max : value < 0n ? 0n : value;

export const getStepIndex = (
  {
    startHeight,
    endHeight,
    stepCount,
  }: Pick<DutchAuctionDescription, 'startHeight' | 'endHeight' | 'stepCount'>,
  fullSyncHeight?: bigint,
): bigint | undefined => {
  if (fullSyncHeight === undefined) return undefined;
  if (fullSyncHeight >= endHeight) return stepCount - 1n; // zero-indexed
  if (fullSyncHeight <= startHeight) return 0n;

  const currentDistanceFromStartHeight = fullSyncHeight - startHeight;
  const endHeightDistanceFromStartHeightInclusive = endHeight - startHeight + 1n;
  const stepSize = endHeightDistanceFromStartHeightInclusive / stepCount;
  const stepIndex = currentDistanceFromStartHeight / stepSize;

  return clampBetweenZeroAnd(stepCount, stepIndex);
};
