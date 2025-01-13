import { ViewService } from '@penumbra-zone/protobuf';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { penumbra } from '@/shared/const/penumbra';
import { connectionStore } from '@/shared/model/connection';
import { useQuery } from '@tanstack/react-query';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

const fetchQuery = (index?: number) => async (): Promise<BalancesResponse[]> => {
  return Array.fromAsync(
    penumbra.service(ViewService).balances({
      accountFilter:
        typeof index !== 'undefined'
          ? new AddressIndex({ account: index, randomizer: new Uint8Array(0) })
          : undefined,
    }),
  );
};

/**
 * Fetches the `BalancesResponse[]` based on the provider connection state.
 * Must be used within the `observer` mobX HOC
 */
export const useBalances = (index?: number) => {
  return useQuery({
    queryKey: ['view-service-balances', index],
    queryFn: fetchQuery(index),
    enabled: connectionStore.connected,
  });
};
