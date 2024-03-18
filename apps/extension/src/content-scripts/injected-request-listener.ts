import { isPraxRequestConnectionMessageEvent } from './message';
import { PraxConnectionReq, PraxConnectionRes } from '../message/prax';

const handleRequest = (ev: MessageEvent<unknown>) => {
  if (isPraxRequestConnectionMessageEvent(ev) && ev.origin === window.origin)
    void (async () => {
      const result = await chrome.runtime.sendMessage<PraxConnectionReq, PraxConnectionRes>(
        PraxConnectionReq.Request,
      );
      window.postMessage({ [PRAX]: result }, '/');
    })();
};

window.addEventListener('message', handleRequest);
