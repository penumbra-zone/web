import {
  Position,
  PositionId,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { connectionStore } from '@/shared/model/connection';
import { planBuildBroadcast } from '@/entities/transaction';
import { openToast } from '@penumbra-zone/ui/Toast';
import { updatePositionsQuery } from './use-positions';

export const closePositions = async (
  positions: { id: PositionId; position: Position }[],
): Promise<void> => {
  try {
    const planReq = new TransactionPlannerRequest({
      positionCloses: positions.map(({ id }) => ({ positionId: id })),
      source: new AddressIndex({ account: connectionStore.subaccount }),
    });

    await planBuildBroadcast('positionClose', planReq);
    await updatePositionsQuery();
  } catch (e) {
    openToast({
      type: 'error',
      message: 'Error with withdraw action',
      description: String(e),
    });
  }
};
