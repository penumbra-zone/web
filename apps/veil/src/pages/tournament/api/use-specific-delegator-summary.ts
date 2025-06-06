import { deserialize } from '@/shared/utils/serializer';
import { useQuery } from '@tanstack/react-query';
import {
  specificDelegatorSummary,
  DelegatorStreaksResponse,
} from '../server/specific-delegator-summary';
import { lqtAddressIndex } from '@penumbra-zone/types/address';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';

export const useSpecificDelegatorSummary = (subaccount: number) => {
  return useQuery({
    queryKey: ['delegator-summary', subaccount],
    staleTime: Infinity,
    queryFn: async () => {
      const revealedAddress = await penumbra
        .service(ViewService)
        .addressByIndex({ addressIndex: lqtAddressIndex(subaccount) });

      const allDelegatorSummaries = deserialize<DelegatorStreaksResponse>(
        await specificDelegatorSummary(),
      );

      // Importantly, we only retrieve the voting streak for the specific address the user
      // chose to reveal for their subaccount. If the user didn't choose to reveal their
      // subaccount, the voting streak will be zero. We could probably do something
      // more sophisticated to reveal votes across subaccounts and then determine the
      // voting streak that way.
      const matchingDelegatorSummary = allDelegatorSummaries.data.find(item =>
        item.address.equals(revealedAddress.address),
      );

      return {
        data: matchingDelegatorSummary,
      };
    },
  });
};
