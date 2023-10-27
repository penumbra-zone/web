import { useQuery } from '@tanstack/react-query';
import { uint8ArrayToString } from '@penumbra-zone/types';
import { viewClient } from '../clients/grpc';
import { useStore } from '../state';
import { accountSelector } from '../state/account';

export const getWalletId = async (): Promise<string> => {
  const res = await viewClient.walletId({});
  if (!res.walletId) throw new Error('No walletId found in response');

  return uint8ArrayToString(res.walletId.inner);
};

export const useWalletId = () => {
  const { isConnected } = useStore(accountSelector);

  const { data } = useQuery({
    enabled: isConnected,
    queryKey: ['wallet-id'],
    queryFn: getWalletId,
    refetchInterval: false,
  });

  return data;
};
