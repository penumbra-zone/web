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

  const groupedRewards = await aggregateRewardsByEpoch(accountFilter!, { votes: responses });

  return groupedRewards;
};

/**
 * Retrieves voting rewards from the ViewService.
 */
export const usePersonalRewards = (subaccount?: number) => {
  const query = useQuery({
    queryKey: ['my-voting-rewards', subaccount], // add epoch index here
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
