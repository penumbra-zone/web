/**
 * We want to represent progress as a decimal between 0 and 1 (inclusive),
 * without letting it go above 1 or below 0 if the full sync height is after the
 * end of the auction or before the beginning, respectively.
 */
const clampToDecimal = (value: number) => Math.min(Math.max(value, 0), 1);

/**
 * Returns the auction's progress as a decimal between 0 and 1, inclusive.
 */
export const getProgress = (
  startHeight: bigint,
  endHeight: bigint,
  fullSyncHeight?: bigint,
  seqNum?: bigint,
): number => {
  if (seqNum) {
    return 1;
  }
  if (!fullSyncHeight) {
    return 0;
  }

  const currentDistanceFromStartHeightInclusive = Number(fullSyncHeight) - Number(startHeight) + 1;
  const endHeightDistanceFromStartHeightInclusive = Number(endHeight) - Number(startHeight) + 1;
  const progress =
    currentDistanceFromStartHeightInclusive / endHeightDistanceFromStartHeightInclusive;

  return clampToDecimal(progress);
};
