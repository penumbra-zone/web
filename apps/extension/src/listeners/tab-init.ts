import { originAlreadyApproved } from '../approve-origin';
import { PraxConnection } from '../message/prax';

// trigger injected-connection-port to init when a known page is loaded.
export const praxTabInit = (
  tabId: number,
  { status, discarded }: chrome.tabs.TabChangeInfo,
  { url }: chrome.tabs.Tab,
) =>
  void (async () => {
    if (
      status === 'complete' &&
      !discarded &&
      url?.startsWith('https://') &&
      (await originAlreadyApproved(url))
    )
      void chrome.tabs.sendMessage(tabId, PraxConnection.Init);
  })();
