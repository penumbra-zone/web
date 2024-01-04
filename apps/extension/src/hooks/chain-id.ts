import { useQuery } from '@tanstack/react-query';
import { viewClient } from '../clients';

export const getChainId = async (): Promise<string> => {
  const res = await viewClient.appParameters({});
  if (!res.parameters?.chainParams) throw new Error('No chain params in response');

  return res.parameters.chainParams.chainId;
};

export const useChainId = () => {
  const { data, refetch } = useQuery({
    queryKey: ['chain-id'],
    queryFn: getChainId,
    refetchInterval: false,
  });

  return { chainId: data, refetch };
};
