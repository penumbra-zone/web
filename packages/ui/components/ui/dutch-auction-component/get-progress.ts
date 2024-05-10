const clampToDecimal = (value: number) => Math.min(Math.max(value, 0), 1);

export const getProgress = (
  startHeight: bigint,
  endHeight: bigint,
  fullSyncHeight?: bigint,
): number => {
  if (!fullSyncHeight) return 0;

  const currentDistanceFromStartHeightInclusive = Number(fullSyncHeight) - Number(startHeight) + 1;
  const endHeightDistanceFromStartHeightInclusive = Number(endHeight) - Number(startHeight) + 1;
  const progress =
    currentDistanceFromStartHeightInclusive / endHeightDistanceFromStartHeightInclusive;

  return clampToDecimal(progress);
};
