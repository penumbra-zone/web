import { TxApproval } from '@penumbra-zone/types/src/internal-msg/tx-approval';
import { InternalMessageHandler } from '@penumbra-zone/types/src/internal-msg/shared';
import { PopupRequest } from '@penumbra-zone/types/src/internal-msg/popup';
import { useStore } from '../../../state';

export const isTxApprovalReq = (req: PopupRequest): req is TxApproval => {
  return req.type === 'TX-APPROVAL';
};

export const handleTxApproval: InternalMessageHandler<TxApproval> = (jsonReq, responder) => {
  useStore.setState(state => {
    state.txApproval.authorizeRequest = jsonReq.authorizeRequest;
    state.txApproval.denomMetadataByAssetId = jsonReq.denomMetadataByAssetId;
    state.txApproval.fullViewingKey = jsonReq.fullViewingKey;
    state.txApproval.responder = responder;
  });
};
