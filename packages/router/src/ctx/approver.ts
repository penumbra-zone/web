import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1/custody_pb';
import { Jsonified } from '@penumbra-zone/types';
import { sendPopupRequest, spawnDetachedPopup } from '@penumbra-zone/types/src/internal-msg/popup';
import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { TxApproval } from '@penumbra-zone/types/src/internal-msg/tx-approval';
import { Code, ConnectError } from '@connectrpc/connect';

export const getTxApproval = async (
  authorizeRequest: AuthorizeRequest,
  transactionView: TransactionView,
): Promise<void> => {
  await spawnDetachedPopup('popup.html#/approval/tx');

  const res = await sendPopupRequest<TxApproval>({
    type: 'TX-APPROVAL',
    request: {
      authorizeRequest: authorizeRequest.toJson() as Jsonified<AuthorizeRequest>,
      transactionView: transactionView.toJson() as Jsonified<TransactionView>,
    },
  });
  if ('error' in res) throw res.error;

  const resAuthorizeRequest = AuthorizeRequest.fromJson(res.data.authorizeRequest);
  const resTransactionView = TransactionView.fromJson(res.data.transactionView);

  if (!authorizeRequest.equals(resAuthorizeRequest) || !transactionView.equals(resTransactionView))
    throw new ConnectError('Invalid response from popup');

  if (!res.data.attitude)
    throw new ConnectError('Transaction was not approved', Code.PermissionDenied);
};
