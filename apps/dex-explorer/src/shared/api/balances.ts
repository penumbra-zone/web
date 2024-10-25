import { ViewService } from '@penumbra-zone/protobuf';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { penumbra } from '@/shared/const/penumbra';
import { connectionStore } from '@/shared/model/connection';
import { useQuery } from '@tanstack/react-query';

const fetchQuery = async (): Promise<BalancesResponse[]> => {
  return Array.fromAsync(penumbra.service(ViewService).balances({}));
};

/**
 * Fetches the `BalancesResponse[]` based on the provider connection state.
 * Must be used within the `observer` mobX HOC
 */
export const useBalances = () => {
  return useQuery({
    queryKey: ['view-service-balances'],
    queryFn: fetchQuery,
    enabled: connectionStore.connected,
  });
};
