import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { DelegatorReward } from '../model/rewards';
import { specificDelegatorRewards } from '../server/specific-delegator-rewards';
import { deserialize, serialize } from '@/shared/utils/serializer';
import { useQuery } from '@tanstack/react-query';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';

async function querySpecificDelegatorRewards(
  address: Address,
  limit?: number,
  page?: number,
): Promise<DelegatorReward[]> {
  return deserialize<DelegatorReward[]>(
    await specificDelegatorRewards(serialize(address), limit, page),
  );
}

export const useSpecificDelegatorRewards = (address: Address, limit?: number, page?: number) => {
  return useQuery({
    queryKey: [bech32mAddress(address), limit, page],
    queryFn: async () => {
      return await querySpecificDelegatorRewards(address, limit, page);
    },
  });
};
