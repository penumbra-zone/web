import { approveOrigin, originAlreadyApproved } from './approve-origin';
import { PraxConnectionReq, PraxConnectionRes } from './message/prax';
import { JsonValue } from '@bufbuild/protobuf';

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
        void chrome.tabs.sendMessage(tabId, PraxConnectionReq.Init);
    })(),
);

// listen for page connection requests.
// this is the only message we handle from an unapproved content script.
chrome.runtime.onMessage.addListener(
  (
    req: PraxConnectionReq.Request | JsonValue,
    sender,
    respond: (arg: PraxConnectionRes) => void,
  ) => {
    if (req !== PraxConnectionReq.Request) return false; // instruct chrome we will not respond

    void approveOrigin(sender).then(
      status => {
        // user made a choice
        respond(status);

        if (status === PraxConnectionRes.Approved) {
          void chrome.tabs.sendMessage(sender.tab!.id!, PraxConnectionReq.Init);
        }
      },
      () => respond(PraxConnectionRes.Denied),
    );

    return true; // instruct chrome to wait for the response
  },
);
