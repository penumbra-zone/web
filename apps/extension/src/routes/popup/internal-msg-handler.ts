import {
  isPopupRequest,
  isTxApprovalReq,
  PopupResponse,
  TxApproval,
} from '@penumbra-zone/types/src/internal-msg/popup';
import { InternalMessageHandler } from '@penumbra-zone/types/src/internal-msg/shared';
import { useStore } from '../../state';
import { txApprovalSelector } from '../../state/tx-approval';

export const popupMsgHandler = (
  req: unknown,
  _: chrome.runtime.MessageSender,
  sendResponse: (x: unknown) => void,
) => {
  if (isPopupRequest(req)) {
    try {
      if (isTxApprovalReq(req)) handleTxApproval(req.request, sendResponse);
      else throw new Error('Unknown popup request');
    } catch (e) {
      const response = {
        type: req.type,
        error: String(e),
      } as PopupResponse;
      sendResponse(response);
    }
    return true;
  }
  return false;
};

export const handleTxApproval: InternalMessageHandler<TxApproval> = (
  { authorizeRequest, transactionView },
  responder,
) =>
  void txApprovalSelector(useStore.getState()).acceptRequest(
    {
      authorizeRequest,
      transactionView,
    },
    responder,
  );
