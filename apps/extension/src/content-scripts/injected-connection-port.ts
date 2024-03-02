import { Prax } from '../message/prax';
import { PraxConnectionPort } from './message';
import { CRSessionClient } from '@penumbra-zone/transport-chrome/session-client';

const initOnce = (req: unknown, _sender: chrome.runtime.MessageSender, respond: () => void) => {
  if (req !== Prax.InitConnection) return false;
  chrome.runtime.onMessage.removeListener(initOnce);

  const port = CRSessionClient.init(PRAX);
  window.postMessage({ [PRAX]: port } satisfies PraxConnectionPort, '/', [port]);
  respond();
  return true;
};

chrome.runtime.onMessage.addListener(initOnce);
