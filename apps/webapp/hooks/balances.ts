import { useMemo } from 'react';
import { client } from '../extension-client';
import { useStreamQuery } from 'penumbra-transport';

export const useBalances = (account: number) => {
  const balances = useMemo(
    () =>
      client.balances({
        accountFilter: {
          account,
        },
        // TODO receive asset balance by id
        // extension receive inner as  {1:12,2:34.....}, need format Uint8Array
        // assetIdFilter: {
        // 	inner: base64ToUint8Array(assetId)
        // }
      }),
    [],
  );

  const { data, end, error } = useStreamQuery(balances);

  return { data, end, error };
};
