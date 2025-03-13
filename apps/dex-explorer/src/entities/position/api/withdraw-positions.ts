import {
  Position,
  PositionId,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { ViewService } from '@penumbra-zone/protobuf';
import { openToast } from '@penumbra-zone/ui/Toast';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { penumbra } from '@/shared/const/penumbra';
import { connectionStore } from '@/shared/model/connection';
import { planBuildBroadcast } from '@/entities/transaction';
import { updatePositionsQuery } from './use-positions';

export const withdrawPositions = async (positions: { id: PositionId; position: Position }[]) => {
  try {
    // Our goal here is to withdraw all the closed position in this subaccount.
    // Problem:
    // 1. Auto-closing position switch to `Closed` without user input
    // 2. We are building a list of positions to withdraw based on the latest on-chain state.
    // 3. This list might contain position for which we do not yet own an associated closed LP NFT.
    // Solution:
    // 1. Track auto-closing positions that we are going to withdraw
    // 2. Inspect our balance to check if we have an associated opened NFT
    // 3. If that's the case, add a `PositionClose` action to the TPR.
    // Later, we can improve the general explorer data flow, for now we should just ship this and
    // make this flow work. This is, at the moment, the **ONLY** thing that matters.

    // First track all the positions we want to withdraw.
    const positionWithdraws = positions
      .filter(({ position }) => {
        return position.state?.state === PositionState_PositionStateEnum.CLOSED;
      })
      .map(({ id, position }) => ({
        positionId: id,
        tradingPair: position.phi?.pair,
        reserves: position.reserves,
      }));

    // Return early if there's no work to do.
    if (!positionWithdraws.length) {
      return;
    }

    // Query the balance, ignoring the subaccount index for now.
    const balances = await Array.fromAsync(penumbra.service(ViewService).balances({}));

    // We collect a list of position ids that are currently opened.
    const openedPositionIdStrings = balances
      .filter(
        ({ balanceView }) =>
          balanceView?.valueView.case === 'knownAssetId' &&
          balanceView.valueView.value.metadata?.base.startsWith('lpnft_opened_'),
      )
      .map(
        ({ balanceView }) =>
          (balanceView?.valueView.case === 'knownAssetId' &&
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Short-circuits properly
            balanceView.valueView.value.metadata?.base.replace('lpnft_opened_', '')) ||
          '',
      );

    // First, we filter for positions that are closed.
    // Then, we filter for mismatched positions.
    const positionCloses = positions
      .filter(
        // Start by filtering for auto-closing position that are closed on-chain.
        ({ position }) => position.state?.state === PositionState_PositionStateEnum.CLOSED,
      )
      .filter(({ id }) => {
        const idStr = bech32mPositionId(id);
        // Now check if id is in openedPositionIdStrings
        return openedPositionIdStrings.includes(idStr);
      })
      .map(({ id: positionId }) => ({ positionId }));

    const planReq = new TransactionPlannerRequest({
      positionWithdraws,
      positionCloses,
      source: new AddressIndex({ account: connectionStore.subaccount }),
    });

    await planBuildBroadcast('positionWithdraw', planReq);
    await updatePositionsQuery();
  } catch (e) {
    openToast({
      type: 'error',
      message: 'Error with withdraw action',
      description: String(e),
    });
  }
};
