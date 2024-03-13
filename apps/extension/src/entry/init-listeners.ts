import { approveOrigin, originAlreadyApproved } from '../approve-origin';
import { Prax, PraxResponder } from '../message/prax';
import { JsonValue } from '@bufbuild/protobuf';
import { maybeStartRPC } from '../launch-offscreen';

// init a session when a page on a connected site is loaded
chrome.tabs.onUpdated.addListener((tabId, { status, discarded }, { url }) => {
  const loadedHttpsPage = status === 'complete' && !discarded && url?.startsWith('https://');
  if (loadedHttpsPage)
    void (async () => {
      const needsInit = await originAlreadyApproved(url!);
      if (needsInit) {
        await maybeStartRPC();
        void chrome.tabs.sendMessage(tabId, Prax.InitConnection);
      }
    })();
});

// listen for new sites requesting connection
// this is the only message we handle from an unapproved origin
chrome.runtime.onMessage.addListener(
  (
    req: Prax.RequestConnection | JsonValue,
    sender,
    respond: PraxResponder<Prax.RequestConnection>,
  ) => {
    if (req !== Prax.RequestConnection) return false; // instruct chrome we will not respond

    void (async () => {
      try {
        await maybeStartRPC();
        const approval = await approveOrigin(sender);
        // user made a choice
        respond(approval ? Prax.ApprovedConnection : Prax.DeniedConnection);
        // init the session
        if (approval) void chrome.tabs.sendMessage(sender.tab!.id!, Prax.InitConnection);
      } catch (e: unknown) {
        /**
         * TODO: any handling? probably:
         * - user closed the dialog
         * - user wasn't logged in
         */
        console.warn('Failed to handle new origin', e);
        respond(); // we don't want to convey errors to an untrusted page
      }
    })();
    return true; // instruct chrome to wait for the response
  },
);
