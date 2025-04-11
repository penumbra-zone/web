import { Chain, ChainRegistryClient } from '@penumbra-labs/registry';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';

// Create a chain registry client instance
export const chainRegistryClient = new ChainRegistryClient();

// Get the chain ID from the view service
export const getChainId = async (): Promise<string | undefined> => {
  const { parameters } = await penumbra.service(ViewService).appParameters({});
  return parameters?.chainId;
};

// Get all available IBC chains that Penumbra can connect to
export const getChains = async (): Promise<Chain[]> => {
  const chainId = await getChainId();
  if (!chainId) {
    throw new Error('Could not fetch chain id');
  }

  try {
    const { ibcConnections } = await chainRegistryClient.remote.get(chainId);
    return ibcConnections;
  } catch (error) {
    console.error('Error fetching IBC connections:', error);
    return []; // Return empty array in case of error
  }
};
