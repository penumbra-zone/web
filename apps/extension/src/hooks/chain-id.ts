import { useQuery } from '@tanstack/react-query';
import { viewClient } from '../clients';
import { localExtStorage } from '@penumbra-zone/storage/chrome/local';
import { AppQuerier } from '@penumbra-zone/query/queriers/app';

export const getChainIdWithFallback = async (): Promise<string> => {
  // Check storage first to see if available
  const grpcEndpoint = await localExtStorage.get('grpcEndpoint');
  if (grpcEndpoint) {
    const queryClient = new AppQuerier({ grpcEndpoint });
    const { chainId } = await queryClient.appParams();
    return chainId;
  }

  // If not, fallback onto the env variable passed in at build time
  return CHAIN_ID;
};

const getChainIdViaViewService = async (): Promise<string> => {
  const { parameters } = await viewClient.appParameters({});
  if (!parameters?.chainId) throw new Error('No chainId in response');

  return parameters.chainId;
};

export const useChainIdQuery = () => {
  const { data, refetch } = useQuery({
    queryKey: ['chain-id'],
    queryFn: getChainIdViaViewService,
    staleTime: Infinity,
  });

  return { chainId: data, refetchChainId: refetch };
};
