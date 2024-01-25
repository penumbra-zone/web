import { handleTxApproval, isTxApprovalReq } from './approval/tx-msg-handler';
import { handlePingReq, isPingReq } from './approval/ping';
import { handleOriginApproval, isOriginApprovalReq } from './approval/origin-connect';
import {
  isPopupRequest,
  PopupRequest,
  PopupResponse,
} from '@penumbra-zone/types/src/internal-msg/popup';

export const popupMsgHandler = (
  req: unknown,
  _: chrome.runtime.MessageSender,
  sendResponse: (x: unknown) => void,
) => {
  if (!isPopupRequest(req)) return;

  try {
    typedMessageRouter(req, sendResponse);
  } catch (e) {
    const response = {
      type: req.type,
      error: String(e),
    } as PopupResponse;
    sendResponse(response);
  }

  // Returning true indicates to chrome that the response will be sent asynchronously
  return true;
};

const typedMessageRouter = (req: PopupRequest, sendResponse: (x: unknown) => void): void => {
  if (isTxApprovalReq(req)) handleTxApproval(req.request, sendResponse);
  if (isPingReq(req)) handlePingReq(req.request, sendResponse);
  if (isOriginApprovalReq(req)) handleOriginApproval(req.request, sendResponse);
};
