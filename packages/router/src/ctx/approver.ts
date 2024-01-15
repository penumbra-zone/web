import { sendPopupRequest, spawnDetachedPopup } from '@penumbra-zone/types/src/internal-msg/popup';
import { TxApproval } from '@penumbra-zone/types/src/internal-msg/tx-approval';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import { Jsonified } from '@penumbra-zone/types';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

export const getTxApproval = async (
  req: AuthorizeRequest,
  denomMetadataByAssetId: Record<string, Jsonified<DenomMetadata>>,
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
      denomMetadataByAssetId,
    },
  });
  if ('error' in res) throw res.error;
  if (!res.data) throw new Error('Transaction was not approved');
};
