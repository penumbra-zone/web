import { useQuery } from '@tanstack/react-query';
import { viewClient } from '../clients/extension-page';

export const getChainId = async (): Promise<string> => {
  const { parameters } = await viewClient.appParameters({});
  if (!parameters?.chainId) throw new Error('No chainId in response');

  return parameters.chainId;
};

export const useChainIdQuery = () => {
  const { data, refetch } = useQuery({
    queryKey: ['chain-id'],
    queryFn: getChainId,
    refetchInterval: false,
  });

  return { chainId: data, refetchChainId: refetch };
};
