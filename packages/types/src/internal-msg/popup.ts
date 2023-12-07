import { TxApproval } from './tx-approval';
import { InternalRequest, InternalResponse, Ping } from './shared';

type PopupSupportedMsg = TxApproval | Ping; // Add more as needed
export type PopupRequest = InternalRequest<PopupSupportedMsg>;
export type PopupResponse = InternalResponse<PopupSupportedMsg>;

const popupRequests: PopupRequest['type'][] = ['TX-APPROVAL', 'PING'];

export const isPopupRequest = (req: unknown): req is PopupRequest => {
  return (
    req != null &&
    typeof req === 'object' &&
    'type' in req &&
    typeof req.type === 'string' &&
    popupRequests.includes(req.type as PopupRequest['type'])
  );
};

export const sendPopupRequest = async <M extends PopupSupportedMsg>(
  req: InternalRequest<M>,
): Promise<InternalResponse<M>> => {
  try {
    return await chrome.runtime.sendMessage(req);
  } catch (e) {
    return { type: req.type, error: e };
  }
};

export const spawnDetachedPopup = async (url: string) => {
  const { top, left, width } = await chrome.windows.getLastFocused();

  await chrome.windows.create({
    url,
    type: 'popup',
    width: 400,
    height: 628,
    top,
    // press the window to the right side of screen
    left: left !== undefined && width !== undefined ? left + (width - 400) : 0,
  });

  // We have to wait for React to bootup, navigate to the page, and render the components
  await new Promise(resolve => {
    setTimeout(resolve, 500);
  });
};
