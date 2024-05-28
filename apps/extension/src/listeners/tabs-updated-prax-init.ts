import { originAlreadyApproved } from '../approve-origin';
import { PraxConnection } from '../message/prax';

// trigger injected-connection-port to init when a known page is loaded.
chrome.tabs.onUpdated.addListener(
  (tabId, { status, discarded }, { url }) =>
    void (async () => {
      if (
        status === 'complete' &&
        !discarded &&
        url?.startsWith('https://') &&
        (await originAlreadyApproved(url))
      )
        void chrome.tabs.sendMessage(tabId, PraxConnection.Init);
    })(),
);
