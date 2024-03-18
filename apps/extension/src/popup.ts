import { PopupMessage, PopupRequest, PopupResponse, PopupType } from './message/popup';
import { PopupPath } from './routes/popup/paths';
import type {
  InternalRequest,
  InternalResponse,
} from '@penumbra-zone/types/src/internal-msg/shared';
import { isChromeResponderDroppedError } from '@penumbra-zone/types/src/internal-msg/chrome-error';
import { sessionExtStorage } from '@penumbra-zone/storage';
import { Code, ConnectError } from '@connectrpc/connect';

export const popup = async <M extends PopupMessage>(
  req: PopupRequest<M>,
): Promise<PopupResponse<M>> => {
  const loggedIn = await sessionExtStorage.get('passwordKey');
  if (!loggedIn) {
    throw new ConnectError('User must login to extension', Code.Unauthenticated);
  }

  await spawnPopup(req.type);
  // We have to wait for React to bootup, navigate to the page, and render the components
  await new Promise(resolve => setTimeout(resolve, 800));
  return chrome.runtime.sendMessage<InternalRequest<M>, InternalResponse<M>>(req).catch(e => {
    if (isChromeResponderDroppedError(e))
      return {
        type: req.type,
        data: null,
      };
    else throw e;
  });
};

const spawnDetachedPopup = async (path: string) => {
  await throwIfAlreadyOpen(path);

  const { top, left, width } = await chrome.windows.getLastFocused();

  await chrome.windows.create({
    url: path,
    type: 'popup',
    width: 400,
    height: 628,
    top,
    // press the window to the right side of screen
    left: left !== undefined && width !== undefined ? left + (width - 400) : 0,
  });
};

const throwIfAlreadyOpen = (path: string) =>
  chrome.runtime
    .getContexts({
      documentUrls: [
        path.startsWith(chrome.runtime.getURL('')) ? path : chrome.runtime.getURL(path),
      ],
    })
    .then(popupContexts => {
      if (popupContexts.length) throw Error('Popup already open');
    });

const spawnPopup = async (pop: PopupType) => {
  const popUrl = new URL(chrome.runtime.getURL('popup.html'));

  switch (pop) {
    case PopupType.OriginApproval:
      popUrl.hash = PopupPath.ORIGIN_APPROVAL;
      return spawnDetachedPopup(popUrl.href);
    case PopupType.TxApproval:
      popUrl.hash = PopupPath.TRANSACTION_APPROVAL;
      return spawnDetachedPopup(popUrl.href);
    default:
      throw Error('Unknown popup type');
  }
};
