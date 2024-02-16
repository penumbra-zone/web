import { handleTxApproval, isTxApprovalReq } from './approval/tx-msg-handler';
import { isPopupRequest, PopupResponse } from '@penumbra-zone/types/src/internal-msg/popup';

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
