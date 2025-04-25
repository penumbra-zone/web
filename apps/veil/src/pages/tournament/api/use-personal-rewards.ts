import { useQuery } from '@tanstack/react-query';
import { connectionStore } from '@/shared/model/connection';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { aggregateRewardsByEpoch } from '../ui/aggregate-rewards';

export interface LQTVote {
  percent: number;
  asset: Metadata;
}

// Retrieves voting rewards and aggregates them by epoch, structured as arrays of votes per epoch,
// and estimates their value in the staking token by converting from delegation tokens.
const fetchRewards = async (
  subaccount = 0,
  epoch: number,
): Promise<
  {
    epochIndex: bigint;
    total: Amount;
  }[]
> => {
  const accountFilter =
    typeof subaccount === 'undefined' ? undefined : new AddressIndex({ account: subaccount });

  const responses = await Array.fromAsync(
    penumbra
      .service(ViewService)
      .tournamentVotes({ accountFilter, epochIndex: BigInt(epoch) }),
  );

  const groupedRewards = await aggregateRewardsByEpoch(accountFilter, { votes: responses });

  return groupedRewards;
};

// Retrieves voting rewards from the view service.
export const usePersonalRewards = (subaccount = 0, epoch?: number) => {
  return useQuery({
    queryKey: ['my-voting-rewards', subaccount, epoch],
    staleTime: Infinity,
    enabled: connectionStore.connected && !!epoch,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- based on `enabled`, epoch is always defined
      return await fetchRewards(connectionStore.subaccount, epoch!);
    },
  });
};
