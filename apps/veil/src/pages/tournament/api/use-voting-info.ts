import { connectionStore } from '@/shared/model/connection';
import {
  Metadata,
  Value,
  ValueView,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { penumbra } from '@/shared/const/penumbra';
import { ViewService } from '@penumbra-zone/protobuf';
import { GetMetadata, useGetMetadata } from '@/shared/api/assets';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { toValueView } from '@/shared/utils/value-view';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import {
  DelegationsByAddressIndexRequest_Filter,
  SpendableNoteRecord,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { useCurrentEpoch } from './use-current-epoch';
import { useQuery } from '@tanstack/react-query';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';
import { addAmounts } from '@penumbra-zone/types/amount';
import { useStakingTokenMetadata } from '@/shared/api/registry';

export interface VotingAbility {
  notes: SpendableNoteRecord[];
  epoch: number;
  account: number;
}

export type VotingInfo =
  | { case: 'loading'; epoch: number | undefined }
  | { case: 'not-connected'; epoch: number | undefined }
  | { case: 'already-voted'; epoch: number; votedFor: ValueView }
  | { case: 'needs-to-delegate'; epoch: number }
  | { case: 'can-vote'; epoch: number; ability: VotingAbility; power: ValueView }
  | { case: 'ended'; epoch: number; currentEpoch: number; votedFor?: ValueView }
  | { case: 'delegated-after-start'; epoch: number }
  | { case: 'error'; epoch: number | undefined; error: Error };

async function votedFor(
  getMetadata: GetMetadata,
  epoch: number,
  account: number,
): Promise<ValueView | undefined> {
  const votes = penumbra.service(ViewService).tournamentVotes({
    accountFilter: new AddressIndex({ account }),
    epochIndex: BigInt(epoch),
  });
  for await (const bundle of votes) {
    const firstVote = bundle.votes[0];
    if (firstVote === undefined) {
      continue;
    }
    return toValueView({
      getMetadata,
      value: new Value({
        amount: new Amount({ lo: 0n, hi: 0n }),
        assetId: firstVote.incentivizedAsset,
      }),
    });
  }
  return undefined;
}

async function votingNotes(epoch: number, account: number): Promise<SpendableNoteRecord[]> {
  const response = penumbra.service(ViewService).lqtVotingNotes({
    accountFilter: new AddressIndex({ account }),
    epochIndex: BigInt(epoch),
  });
  const out: SpendableNoteRecord[] = [];
  for await (const bundle of response) {
    if (bundle.noteRecord) {
      out.push(bundle.noteRecord);
    }
  }
  return out;
}

async function hasDelegated(account: number): Promise<boolean> {
  const response = penumbra.service(ViewService).delegationsByAddressIndex({
    addressIndex: new AddressIndex({ account }),
    filter: DelegationsByAddressIndexRequest_Filter.ALL_ACTIVE_WITH_NONZERO_BALANCES,
  });
  for await (const bundle of response) {
    if (bundle.valueView) {
      return true;
    }
  }
  return false;
}

async function query(
  getMetadata: GetMetadata,
  stakingTokenMetadata: Metadata,
  epoch: number,
  account: number,
): Promise<VotingInfo> {
  const votedForP = votedFor(getMetadata, epoch, account);
  const votingNotesP = votingNotes(epoch, account);
  const hasDelegatedP = hasDelegated(account);
  const [votedForR, votingNotesR, hasDelegatedR] = await Promise.all([
    votedForP,
    votingNotesP,
    hasDelegatedP,
  ]);
  if (votedForR) {
    return { case: 'already-voted', epoch, votedFor: votedForR };
  }
  if (votingNotesR.length > 0) {
    const amount = votingNotesR.reduce(
      (acc, x) => (x.note?.value?.amount ? addAmounts(acc, x.note.value.amount) : acc),
      new Amount({ lo: 0n, hi: 0n }),
    );
    const clonedMeta = stakingTokenMetadata.clone();
    clonedMeta.symbol = 'delUM';
    const power = toValueView({ amount, metadata: clonedMeta });
    return { case: 'can-vote', epoch, ability: { notes: votingNotesR, epoch, account }, power };
  }
  if (hasDelegatedR) {
    return { case: 'delegated-after-start', epoch };
  }

  return { case: 'needs-to-delegate', epoch };
}

export function useVotingInfo(epoch?: number): VotingInfo {
  const getMetadata = useGetMetadata();
  const { data: stakingTokenMetadata } = useStakingTokenMetadata();
  const { connectedLoading, connected, subaccount: account } = connectionStore;
  const { epoch: currentEpoch, isLoading: epochLoading } = useCurrentEpoch();
  const theEpoch = epoch ?? currentEpoch;
  const votingQuery = useQuery({
    queryKey: ['voting-info', theEpoch, account],
    staleTime: Infinity,
    queryFn: () => {
      if (!theEpoch) {
        throw new Error('epoch unexpectedly undefined');
      }
      return query(getMetadata, stakingTokenMetadata, theEpoch, account);
    },
    enabled: connected && theEpoch !== undefined,
  });
  useRefetchOnNewBlock(['voting-info', theEpoch, account], votingQuery, !connected || !theEpoch);
  if (!connectedLoading && !connected) {
    return { case: 'not-connected', epoch: theEpoch };
  }
  if (
    connectedLoading ||
    theEpoch === undefined ||
    currentEpoch === undefined ||
    epochLoading ||
    votingQuery.isPending
  ) {
    return { case: 'loading', epoch: theEpoch };
  }
  if (votingQuery.error) {
    return { case: 'error', epoch: theEpoch, error: votingQuery.error };
  }
  if (currentEpoch > theEpoch) {
    return {
      case: 'ended',
      epoch: theEpoch,
      currentEpoch,
      votedFor: votingQuery.data.case === 'already-voted' ? votingQuery.data.votedFor : undefined,
    };
  }
  return votingQuery.data;
}
