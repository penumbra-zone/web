import {
  specificDelegatorRewards,
  SpecificDelegatorRewardsRequest,
  SpecificDelegatorRewardsResponse,
} from '../server/specific-delegator-rewards';
import { deserialize, serialize } from '@/shared/utils/serializer';
import { useQuery } from '@tanstack/react-query';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';

export type {
  SpecificDelegatorRewardsRequest,
  SpecificDelegatorRewardsResponse,
  SortKey,
  SortDirection,
} from '../server/specific-delegator-rewards';

async function querySpecificDelegatorRewards(
  request: SpecificDelegatorRewardsRequest,
): Promise<SpecificDelegatorRewardsResponse> {
  return deserialize<SpecificDelegatorRewardsResponse>(
    await specificDelegatorRewards(serialize(request)),
  );
}

export const useSpecificDelegatorRewards = (req: SpecificDelegatorRewardsRequest) => {
  return useQuery({
    queryKey: [
      bech32mAddress(req.address),
      req.sortDirection ?? 'epoch',
      req.sortKey ?? 'desc',
      req.limit,
      req.page,
    ],
    queryFn: async () => {
      return await querySpecificDelegatorRewards(req);
    },
  });
};
