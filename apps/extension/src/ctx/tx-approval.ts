import { sendPopupRequest, spawnDetachedPopup } from '@penumbra-zone/types/src/internal-msg/popup';
import { TxApproval } from '@penumbra-zone/types/src/internal-msg/tx-approval';

import type { GetTxApprovalFn } from '@penumbra-zone/router';

export const getTxApproval: GetTxApprovalFn = async req => {
  await spawnDetachedPopup('popup.html#/approval/tx');

  const res = await sendPopupRequest<TxApproval>({
    type: 'TX-APPROVAL',
    request: req.toJson(),
  });
  if ('error' in res) throw res.error;
  if (!res.data) throw new Error('Transaction was not approved');
};
