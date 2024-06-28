/**
 * Reference implementation: https://github.com/penumbra-zone/ibc-types/blob/73da5ee5d06b5f62c186b31ce37f7669edc8bbf2/crates/ibc-types-core-connection/src/identifier.rs#L76-L87
 *
 * Extract the version from the given chain identifier.
 * Example outputs:
 * - chainVersion("chain--a-0") -> 0
 * - chainVersion("ibc-10") -> 10
 * - chainVersion("cosmos-hub-97") -> 97
 * - chainVersion("testnet-helloworld-2") -> 2
 */
export const parseRevisionNumberFromChainId = (chainId: string): bigint => {
  if (!isEpochFormat(chainId)) {
    return 0n;
  }

  const numStr = chainId.split('-').pop()!;
  return BigInt(numStr);
};

/**
 * isEpochFormat() checks if a chain_id is in the format required for parsing epochs.
 * The chainID must be in the form: {chainID}-{version}
 * Example outputs:
 * - isEpochFormat("chainA-0") -> false
 * - isEpochFormat("chainA") -> false
 * - isEpochFormat("chainA-1") -> true
 * - isEpochFormat("c-1") -> true
 */
const isEpochFormat = (chainId: string): boolean => {
  const regex = /.*[^-]-[1-9][0-9]*$/;
  return regex.test(chainId);
};
