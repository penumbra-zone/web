import { PraxConnectionPort } from './message';
import { CRSessionClient } from '@penumbra-zone/transport-chrome/session-client';
import { PraxConnectionReq } from '../message/prax';

// this inits the session client that transports messages on the DOM channel through the Chrome runtime
const initOnce = (req: unknown, _sender: chrome.runtime.MessageSender, respond: () => void) => {
  if (req !== PraxConnectionReq.Init) return false;
  chrome.runtime.onMessage.removeListener(initOnce);

  const port = CRSessionClient.init(PRAX);
  window.postMessage({ [PRAX]: port } satisfies PraxConnectionPort, '/', [port]);
  respond();
  return true;
};

chrome.runtime.onMessage.addListener(initOnce);
