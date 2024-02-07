import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1/custody_pb';
import { Jsonified } from '@penumbra-zone/types';
import { sendPopupRequest, spawnDetachedPopup } from '@penumbra-zone/types/src/internal-msg/popup';
import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { TxApproval } from '@penumbra-zone/types/src/internal-msg/tx-approval';

export const getTxApproval = async (
  req: AuthorizeRequest,
  transactionViewFromPlan: TransactionView,
): Promise<void> => {
  await spawnDetachedPopup('popup.html#/approval/tx');

  /**
   * @todo: Should this include a request ID so as not to cross wires with other
   * requests?
   */
  const res = await sendPopupRequest<TxApproval>({
    type: 'TX-APPROVAL',
    request: {
      authorizeRequest: req.toJson() as Jsonified<AuthorizeRequest>,
      transactionViewFromPlan: transactionViewFromPlan.toJson() as Jsonified<TransactionView>,
    },
  });
  if ('error' in res) throw res.error;
  if (!res.data) throw new Error('Transaction was not approved');
};
