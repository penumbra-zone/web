import {
  TransactionPlannerRequest,
  TransactionPlannerRequest_ActionLiquidityTournamentVote,
  SpendableNoteRecord,
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
    const voteAction = new TransactionPlannerRequest_ActionLiquidityTournamentVote({
      incentivized: denom,
      rewardsRecipient,
      stakedNotes,
      epochIndex,
    });

    const planReq = new TransactionPlannerRequest({
      actionLiquidityTournamentVote: [voteAction],
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
