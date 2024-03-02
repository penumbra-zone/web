import { isPraxRequestConnectionMessageEvent } from './message';
import { Prax } from '../message/prax';

const handleRequest = (ev: MessageEvent<unknown>) => {
  if (isPraxRequestConnectionMessageEvent(ev) && ev.origin === window.origin)
    void (async () => {
      const result = await chrome.runtime.sendMessage<
        Prax.RequestConnection,
        Prax.ApprovedConnection | Prax.DeniedConnection
      >(Prax.RequestConnection);
      window.postMessage({ [PRAX]: result }, '/');
    })();
};

window.addEventListener('message', handleRequest);
