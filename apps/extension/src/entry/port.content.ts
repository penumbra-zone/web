import { PraxMessage } from '../message-event';
import { CRSessionClient } from '@penumbra-zone/transport-chrome/session-client';
import { PraxConnection } from '../message/prax';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    // this inits the session client that transports messages on the DOM channel through the Chrome runtime
    const initOnce = (req: unknown, _sender: chrome.runtime.MessageSender, respond: () => void) => {
      if (req !== PraxConnection.Init) return false;
      chrome.runtime.onMessage.removeListener(initOnce);

      const port = CRSessionClient.init(PRAX);
      window.postMessage({ [PRAX]: port } satisfies PraxMessage<MessagePort>, '/', [port]);
      respond();
      return true;
    };

    chrome.runtime.onMessage.addListener(initOnce);
  },
});
