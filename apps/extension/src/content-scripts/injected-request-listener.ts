import { isPraxRequestConnectionMessageEvent } from './message';
import { PraxConnectionReq } from '../message/prax';
import { PraxConnectionRes } from '@penumbra-zone/client/src/global';

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
