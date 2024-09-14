// Used to determine whether trial decryption should be skipped for this block
export const shouldSkipTrialDecrypt = (
  creationHeight: number | undefined,
  currentHeight: bigint,
) => {
  if (creationHeight === undefined || creationHeight === 0) {
    return false;
  }

  return currentHeight < BigInt(creationHeight);
};
