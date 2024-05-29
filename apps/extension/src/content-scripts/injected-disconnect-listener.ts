import { isPraxEndMessageEvent } from './message-event';
import { PraxConnection } from '../message/prax';

const handleDisconnect = (ev: MessageEvent<unknown>) => {
  if (ev.origin === window.origin && isPraxEndMessageEvent(ev)) {
    window.removeEventListener('message', handleDisconnect);
    void chrome.runtime.sendMessage<PraxConnection>(PraxConnection.End);
    //.then(() => window.location.reload());
  }
};
window.addEventListener('message', handleDisconnect);
