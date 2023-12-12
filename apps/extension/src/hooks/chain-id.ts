import { useQuery } from '@tanstack/react-query';
import { AppQuerier } from '@penumbra-zone/query';
import { useStore } from '../state';

export const getChainId = async (): Promise<string> => {
  const grpcEndpoint = useStore.getState().network.grpcEndpoint;

  if (!grpcEndpoint) throw new Error('GRPC endpoint is not set');

  const querier = new AppQuerier({ grpcEndpoint });
  const res = await querier.chainParams();
  if (!res.chainId) throw new Error('No chain params in response');

  return res.chainId;
};

export const useChainId = () => {
  const { data, refetch } = useQuery({
    queryKey: ['chain-id'],
    queryFn: getChainId,
    refetchInterval: false,
  });

  return { chainId: data, refetch };
};
