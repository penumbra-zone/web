import { sendPopupRequest, spawnDetachedPopup } from '@penumbra-zone/types/src/internal-msg/popup';
import { TxApproval } from '@penumbra-zone/types/src/internal-msg/tx-approval';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';

export const getTxApproval = async (req: AuthorizeRequest): Promise<void> => {
  await spawnDetachedPopup('popup.html#/approval/tx');

  const res = await sendPopupRequest<TxApproval>({
    type: 'TX-APPROVAL',
    request: req.toJson(),
  });
  if ('error' in res) throw res.error;
  if (!res.data) throw new Error('Transaction was not approved');
};
