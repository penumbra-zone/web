import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1/custody_pb';
import { JsonValue, PartialMessage } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import { errorFromJson } from '@connectrpc/connect/protocol-connect';
import type { Jsonified } from '@penumbra-zone/types/src/jsonified';
import { PopupType, TxApproval } from './message/popup';
import { popup } from './popup';

export const approveTransaction = async (
  partialAuthorizeRequest: PartialMessage<AuthorizeRequest>,
  partialTransactionView: PartialMessage<TransactionView>,
) => {
  const authorizeRequest = new AuthorizeRequest(partialAuthorizeRequest);
  const transactionView = new TransactionView(partialTransactionView);

  const res = await popup<TxApproval>({
    type: PopupType.TxApproval,
    request: {
      authorizeRequest: new AuthorizeRequest(
        authorizeRequest,
      ).toJson() as Jsonified<AuthorizeRequest>,
      transactionView: new TransactionView(transactionView).toJson() as Jsonified<TransactionView>,
    },
  });
  if ('error' in res)
    throw errorFromJson(res.error as JsonValue, undefined, ConnectError.from(res));

  const resAuthorizeRequest = AuthorizeRequest.fromJson(res.data.authorizeRequest);
  const resTransactionView = TransactionView.fromJson(res.data.transactionView);

  if (!authorizeRequest.equals(resAuthorizeRequest) || !transactionView.equals(resTransactionView))
    throw new Error('Invalid response from popup');

  return res.data.choice;
};
