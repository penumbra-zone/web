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

export const voteTournament = async ({
  incentivized,
  rewardsRecipient,
  stakedNotes,
  epochIndex,
}: {
  incentivized: string;
  rewardsRecipient: Address | undefined;
  stakedNotes: SpendableNoteRecord[];
  epochIndex: number;
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
        epochIndex: BigInt(epochIndex),
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
  const stakedNotes =
    votingNotes
      ?.filter(res => res.noteRecord !== undefined)
      .map(res => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- note exists
        note: res.noteRecord!,
        alreadyVoted: res.alreadyVoted,
      })) ?? [];

  // Check if all notes have been used for voting in the current epoch.
  const allNotesVoted =
    stakedNotes.length > 0 &&
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- explicit check for clarity
    stakedNotes.every(({ alreadyVoted }) => alreadyVoted === true);

  return allNotesVoted;
};
