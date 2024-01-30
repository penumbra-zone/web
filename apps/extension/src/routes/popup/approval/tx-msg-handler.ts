import { TxApproval } from '@penumbra-zone/types/src/internal-msg/tx-approval';
import { InternalMessageHandler } from '@penumbra-zone/types/src/internal-msg/shared';
import { PopupRequest } from '@penumbra-zone/types/src/internal-msg/popup';
import { useStore } from '../../../state';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import {
  asPublicTransactionView,
  asReceiverTransactionView,
  classifyTransaction,
} from '@penumbra-zone/types';
import { isControlledAddress } from './is-controlled-address';

export const isTxApprovalReq = (req: PopupRequest): req is TxApproval => {
  return req.type === 'TX-APPROVAL';
};

export const handleTxApproval: InternalMessageHandler<TxApproval> = (jsonReq, responder) => {
  const authorizeRequestAsString = AuthorizeRequest.fromJson(
    jsonReq.authorizeRequest,
  ).toJsonString();

  const transactionView = TransactionView.fromJson(jsonReq.transactionViewFromPlan);

  void (async () => {
    const asSender = transactionView.toJsonString();
    const asPublic = asPublicTransactionView(transactionView).toJsonString();
    const asReceiver = (
      await asReceiverTransactionView(transactionView, { isControlledAddress })
    ).toJsonString();

    useStore.setState(state => {
      state.txApproval.authorizeRequest = authorizeRequestAsString;
      state.txApproval.asSender = asSender;
      state.txApproval.asReceiver = asReceiver;
      state.txApproval.asPublic = asPublic;
      state.txApproval.transactionClassification = classifyTransaction(transactionView);
      state.txApproval.responder = responder;
    });
  })();
};
