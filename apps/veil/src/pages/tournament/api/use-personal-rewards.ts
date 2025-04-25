import { useQuery } from '@tanstack/react-query';
import { connectionStore } from '@/shared/model/connection';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { statusStore } from '@/shared/model/status';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { aggregateRewardsByEpoch } from '../ui/aggregate-rewards';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';

export interface LQTVote {
  percent: number;
  asset: Metadata;
}

export interface VotingReward {
  epoch: number;
  reward: ValueView;
  vote: LQTVote;
  sort?: {
    epoch: number;
    reward: number;
  };
}

// Retrieves voting rewards and aggregates them by epoch, structured as arrays of votes per epoch,
// and estimates their value in the staking token by converting from delegation tokens.
const fetchRewards = async (
  subaccount?: number,
): Promise<
  {
    epochIndex: bigint;
    total: Amount;
  }[]
> => {
  const accountFilter =
    typeof subaccount === 'undefined' ? undefined : new AddressIndex({ account: subaccount });
  const { latestKnownBlockHeight } = statusStore;

  const responses = await Array.fromAsync(
    penumbra
      .service(ViewService)
      .tournamentVotes({ accountFilter, blockHeight: latestKnownBlockHeight }),
  );

  const groupedRewards = await aggregateRewardsByEpoch(accountFilter, { votes: responses });

  return groupedRewards;
};

// Retrieves voting rewards from the view service.
export const usePersonalRewards = (subaccount?: number) => {
  // TODO: pass the epoch index from the `useCurrentEpoch` hook into the query key
  const query = useQuery({
    queryKey: ['my-voting-rewards', subaccount],
    staleTime: Infinity,
    enabled: connectionStore.connected,
    queryFn: async () => {
      return await fetchRewards(subaccount);
    },
  });

  const { data, isLoading } = query;

  return {
    data,
    isLoading,
  };
};
