import { JsonValue } from '@bufbuild/protobuf';
import { InternalMessage, InternalRequest, InternalResponse } from './internal-message';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';

import { useStore } from '../state';

export type TxApprovalResponder = (res: InternalResponse<PopupTxApproval>) => void;

type PopupMessage = PopupTxApproval;
type PopupTxApproval = InternalMessage<'TX_APPROVAL', JsonValue, boolean>;

export const isPopupRequest = (req: unknown): req is InternalRequest<PopupMessage> =>
  typeof req === 'object' && req != null && 'type' in req && req.type === 'TX_APPROVAL';

const sendPopupRequest = async <M extends PopupMessage>(req: InternalRequest<M>): Promise<void> => {
  const res = await chrome.runtime.sendMessage<InternalRequest<M>, InternalResponse<M>>(req);
  if ('error' in res) throw new Error(String(res.error));
  if (!res.data) throw new Error('Transaction was not approved');
};

const spawnDetachedPopup = async (url: string) => {
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

export const popupControlHandler: Parameters<typeof chrome.runtime.onMessage.addListener>[0] = (
  message,
  sender,
  sendResponse,
) => {
  if (sender.id !== chrome.runtime.id) return; // unhandled
  if (!isPopupRequest(message)) return; // unhandled
  switch (message.type) {
    case 'TX_APPROVAL':
      useStore.setState(state => {
        // @ts-expect-error Typescript doesn't like JsonValue could possibly be very deep
        state.txApproval.tx = message.request;
        state.txApproval.responder = sendResponse;
      });
      break;
  }
  return true;
};

export const popupControl = {
  txApproval: async (req: AuthorizeRequest) =>
    spawnDetachedPopup('popup.html#/approval/tx').then(() =>
      sendPopupRequest<PopupTxApproval>({
        type: 'TX_APPROVAL',
        request: req.toJson(),
      }),
    ),
};
