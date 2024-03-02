import { approveOrigin, originAlreadyApproved } from './approve-origin';
import { Prax, PraxResponder } from './message/prax';
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
        void chrome.tabs.sendMessage(tabId, Prax.InitConnection);
    })(),
);

// listen for page connection requests.
// this is the only message we handle from an unapproved content script.
chrome.runtime.onMessage.addListener(
  (
    req: Prax.RequestConnection | JsonValue,
    sender,
    respond: PraxResponder<Prax.RequestConnection>,
  ) => {
    console.log('chrome runtime request listener');
    if (req !== Prax.RequestConnection) return false; // instruct chrome we will not respond

    void approveOrigin(sender).then(
      approval => {
        // user made a choice
        respond(approval ? Prax.ApprovedConnection : Prax.DeniedConnection);
        if (approval) void chrome.tabs.sendMessage(sender.tab!.id!, Prax.InitConnection);
      },
      () => respond(),
    );

    return true; // instruct chrome to wait for the response
  },
);
