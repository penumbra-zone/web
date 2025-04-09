import {
  TransactionPlannerRequest,
  SpendableNoteRecord,
  LqtVotingNotesResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AddressIndex, Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { connectionStore } from '@/shared/model/connection';
import { planBuildBroadcast } from '@/entities/transaction';
import { openToast } from '@penumbra-zone/ui/Toast';
import { Denom } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export interface VoteParams {
  notes: SpendableNoteRecord[];
  assetId: string;
  epoch: number;
  rewardsRecipient: Address;
  reveal: boolean;
}

export const voteTournament = async ({
  incentivized,
  rewardsRecipient,
  stakedNotes,
  epochIndex,
}: {
  incentivized: string;
  rewardsRecipient: Address;
  stakedNotes: SpendableNoteRecord[];
  epochIndex: bigint;
}): Promise<void> => {
  try {
    // Construct the asset denom from the selected asset symbol
    const denom = new Denom({
      denom: incentivized.toLowerCase(),
    });

    // Construct the LQT voting actions
    const actionLiquidityTournamentVote = [
      {
        incentivized: denom,
        rewardsRecipient,
        stakedNotes,
        epochIndex,
      },
    ];

    const planReq = new TransactionPlannerRequest({
      actionLiquidityTournamentVote,
      source: new AddressIndex({ account: connectionStore.subaccount }),
    });

    await planBuildBroadcast('liquidityTournamentVote', planReq);
  } catch (e) {
    openToast({
      type: 'error',
      message: 'Error with withdraw action',
      description: String(e),
    });
  }
};

export const checkIfAlreadyVoted = ({
  votingNotes,
}: {
  votingNotes: LqtVotingNotesResponse[] | undefined;
}): boolean => {
  const stakedNotes = votingNotes
    ? Array.from(votingNotes.values())
        .filter(res => !!res.noteRecord)
        .map(res => ({
          note: res.noteRecord as SpendableNoteRecord,
          alreadyVoted: res.alreadyVoted,
        }))
    : [];

  // Check if all notes have been used for voting in the current epoch.
  const allNotesVoted =
    stakedNotes.length > 0 && stakedNotes.every(({ alreadyVoted }) => alreadyVoted === true);

  return allNotesVoted;
};
