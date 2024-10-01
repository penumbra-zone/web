export const getSyncPercent = (
  fullSyncHeight: bigint,
  latestKnownBlockHeight: bigint,
): { syncPercent: number, syncPercentStringified: string } => {
  let percentSyncedNumber = 0;
  if (latestKnownBlockHeight) {
    percentSyncedNumber = Number(fullSyncHeight) / Number(latestKnownBlockHeight);
    if (percentSyncedNumber > 1) {
      percentSyncedNumber = 1;
    }
  }

  // Round down to ensure whole numbers
  const roundedPercentSyncedNumber = Math.floor(percentSyncedNumber * 100);

  return {
    syncPercent: roundedPercentSyncedNumber / 100,
    syncPercentStringified: `${roundedPercentSyncedNumber}%`,
  }
};
