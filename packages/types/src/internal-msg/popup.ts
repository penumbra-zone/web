import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1/custody_pb';
import { Jsonified } from '../jsonified';
import { InternalMessage, InternalRequest, InternalResponse } from './shared';

type PopupSupportedMsg = TxApproval; // Add more as needed
export type PopupRequest = InternalRequest<PopupSupportedMsg>;
export type PopupResponse = InternalResponse<PopupSupportedMsg>;

const popupRequests: PopupRequest['type'][] = ['TX-APPROVAL'];

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

export const spawnDetachedPopup = async (path: string) => {
  const alreadyPopup = await chrome.runtime.getContexts({
    documentUrls: [chrome.runtime.getURL(path)],
  });
  if (alreadyPopup.length) throw new Error('Popup already open');

  const { top, left, width } = await chrome.windows.getLastFocused();

  await chrome.windows.create({
    url: chrome.runtime.getURL(path),
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

export type TxApproval = InternalMessage<
  'TX-APPROVAL',
  {
    authorizeRequest: Jsonified<AuthorizeRequest>;
    transactionView: Jsonified<TransactionView>;
  },
  {
    attitude: boolean;
    authorizeRequest: Jsonified<AuthorizeRequest>;
    transactionView: Jsonified<TransactionView>;
  }
>;

export const isTxApprovalReq = (req: PopupRequest): req is TxApproval => {
  // more types in the future
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return req.type === 'TX-APPROVAL';
};
