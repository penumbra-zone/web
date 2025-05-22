import { deserialize, serialize } from '@/shared/utils/serializer';
import { useQuery } from '@tanstack/react-query';
import {
  specificDelegatorSummary,
  SpecificDelegatorSummaryResponse,
} from '../server/specific-delegator-summary';
import { penumbra } from '@/shared/const/penumbra';
import { ViewService } from '@penumbra-zone/protobuf';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

async function querySpecificDelegatorSummary(
  address: Address,
): Promise<SpecificDelegatorSummaryResponse> {
  return deserialize<SpecificDelegatorSummaryResponse>(
    await specificDelegatorSummary(serialize({ address })),
  );
}

export const useSpecificDelegatorSummary = (subaccount?: number) => {
  return useQuery({
    queryKey: ['delegator-summary', subaccount],
    staleTime: Infinity,
    queryFn: async () => {
      const service = penumbra.service(ViewService);
      const { address } = await service.addressByIndex({
        addressIndex: { account: subaccount },
      });

      if (!address) throw new Error('address not found');

      return querySpecificDelegatorSummary(address);
    },
  });
};
