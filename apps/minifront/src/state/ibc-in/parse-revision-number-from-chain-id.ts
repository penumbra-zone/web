/**
 * Examples:
 * getRevisionNumberFromChainId("grand-1") returns 1n
 * getRevisionNumberFromChainId("osmo-test-5") returns 5n
 * getRevisionNumberFromChainId("penumbra-testnet-deimos-7") returns 7n
 */
export const parseRevisionNumberFromChainId = (chainId: string): bigint => {
  const match = chainId.match(/-(\d+)$/);
  if (match?.[1]) {
    return BigInt(match[1]);
  } else {
    throw new Error(`No revision number found within chain id: ${chainId}`);
  }
};
