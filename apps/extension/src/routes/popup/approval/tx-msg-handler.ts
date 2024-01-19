import { TxApproval } from '@penumbra-zone/types/src/internal-msg/tx-approval';
import { InternalMessageHandler } from '@penumbra-zone/types/src/internal-msg/shared';
import { PopupRequest } from '@penumbra-zone/types/src/internal-msg/popup';
import { useStore } from '../../../state';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

export const isTxApprovalReq = (req: PopupRequest): req is TxApproval => {
  return req.type === 'TX-APPROVAL';
};

export const handleTxApproval: InternalMessageHandler<TxApproval> = (jsonReq, responder) => {
  useStore.setState(state => {
    state.txApproval.authorizeRequest = AuthorizeRequest.fromJson(
      jsonReq.authorizeRequest,
    ).toJsonString();
    state.txApproval.transactionView = TransactionView.fromJson(
      jsonReq.transactionViewFromPlan,
    ).toJsonString();
    state.txApproval.responder = responder;
  });
};
