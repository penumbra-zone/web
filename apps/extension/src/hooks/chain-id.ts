import { useQuery } from '@tanstack/react-query';
import { viewClient } from '../clients';

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
