import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1/custody_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import type { Jsonified } from '@penumbra-zone/types/src/jsonified';
import { PopupType, TxApproval } from './message/popup';
import { popup } from './popup';

export const approveTransaction = async (
  partialAuthorizeRequest: PartialMessage<AuthorizeRequest>,
  partialTransactionView: PartialMessage<TransactionView>,
) => {
  const authorizeRequest = new AuthorizeRequest(partialAuthorizeRequest);
  const transactionView = new TransactionView(partialTransactionView);

  const popupResponse = await popup<TxApproval>({
    type: PopupType.TxApproval,
    request: {
      authorizeRequest: new AuthorizeRequest(
        authorizeRequest,
      ).toJson() as Jsonified<AuthorizeRequest>,
      transactionView: new TransactionView(transactionView).toJson() as Jsonified<TransactionView>,
    },
  });

  if (popupResponse) {
    const resAuthorizeRequest = AuthorizeRequest.fromJson(popupResponse.authorizeRequest);
    const resTransactionView = TransactionView.fromJson(popupResponse.transactionView);

    if (
      !authorizeRequest.equals(resAuthorizeRequest) ||
      !transactionView.equals(resTransactionView)
    )
      throw new Error('Invalid response from popup');
  }

  return popupResponse?.choice;
};
