import { useQuery } from '@tanstack/react-query';
import { stdClient } from '../clients/std';

export const isConnected = async (): Promise<boolean> => {
  return await stdClient.isConnected();
};

export const useConnect = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['is-connected'],
    queryFn: isConnected,
    refetchInterval: 500,
  });

  const connect = async () => await stdClient.connect();

  return { isConnected: Boolean(data), isLoading, connect };
};
