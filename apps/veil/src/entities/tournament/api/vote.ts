import {
  TransactionPlannerRequest,
  SpendableNoteRecord,
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
