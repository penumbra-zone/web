import { useMemo } from 'react';
import { grpcClient } from '../extension-client';
import { useCollectedStream } from 'penumbra-transport';

export const useBalances = ({ account }: { account: number }) => {
  const balances = useMemo(
    () =>
      grpcClient.balances({
        accountFilter: {
          account,
        },
        // TODO receive asset balance by id
        // extension receive inner as  {1:12,2:34.....}, need format Uint8Array
      }),
    [account],
  );

  return useCollectedStream(balances);
};
