import { useQuery } from '@tanstack/react-query';
import { uint8ArrayToString } from 'penumbra-types';
import { viewClient } from '../clients/grpc';

export const getWalletId = async (): Promise<string> => {
  const res = await viewClient.walletId({});
  if (!res.walletId) throw new Error('No walletId found in response');

  return uint8ArrayToString(res.walletId.inner);
};

export const useWalletId = () => {
  const { data } = useQuery({
    queryKey: ['wallet-id'],
    queryFn: getWalletId,
    refetchInterval: false,
  });

  return data;
};
