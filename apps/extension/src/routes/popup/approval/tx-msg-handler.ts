import { TxApproval } from '@penumbra-zone/types/src/internal-msg/tx-approval';
import { InternalMessageHandler } from '@penumbra-zone/types/src/internal-msg/shared';
import { PopupRequest } from '@penumbra-zone/types/src/internal-msg/popup';
import { useStore } from '../../../state';
import { txApprovalSelector } from '../../../state/tx-approval';

export const isTxApprovalReq = (req: PopupRequest): req is TxApproval => {
  // more types in the future
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return req.type === 'TX-APPROVAL';
};

export const handleTxApproval: InternalMessageHandler<TxApproval> = (
  { authorizeRequest, transactionView },
  responder,
) =>
  void txApprovalSelector(useStore.getState()).acceptRequest(
    {
      authorizeRequest,
      transactionView,
    },
    responder,
  );
