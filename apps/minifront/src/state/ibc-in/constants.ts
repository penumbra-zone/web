// Chains using specifically bech32 encoding (not bech32m)
export const bech32Chains = ['noble', 'nobletestnet'];

export const blockExplorerTxBase: Record<string, string> = {
  'osmo-test-5': 'https://www.mintscan.io/osmosis-testnet/tx',
  'grand-1': 'https://www.mintscan.io/noble-testnet/tx',
};
