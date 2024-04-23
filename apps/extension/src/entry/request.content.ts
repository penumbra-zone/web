import { PraxMessage, isPraxRequestMessageEvent } from '../message-event';
import { PraxConnection } from '../message/prax';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    const handleRequest = (ev: MessageEvent<unknown>) => {
      if (ev.origin === window.origin && isPraxRequestMessageEvent(ev)) {
        void (async () => {
          window.removeEventListener('message', handleRequest);
          const result = await chrome.runtime.sendMessage<
            PraxConnection,
            Exclude<PraxConnection, PraxConnection.Request>
          >(PraxConnection.Request);
          // init is handled by injected-connection-port
          if (result !== PraxConnection.Init)
            window.postMessage(
              { [PRAX]: result } satisfies PraxMessage<
                PraxConnection.Denied | PraxConnection.NeedsLogin
              >,
              '/',
            );
        })();
      }
    };

    window.addEventListener('message', handleRequest);
  },
});
