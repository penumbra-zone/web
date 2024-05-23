import { Code, ConnectError } from '@connectrpc/connect';
import { approveSender } from '../approve-origin';
import { PenumbraAccessRequest, PenumbraAccessResponse } from '@penumbra-zone/client/messages';
import { UserChoice } from '@penumbra-zone/types/user-choice';

export const penumbraRequestListener = (
  req: unknown,
  sender: chrome.runtime.MessageSender,
  respond: (arg: PenumbraAccessResponse) => void,
) => {
  // if this isn't a request, instruct chrome we will not respond
  if (req !== PenumbraAccessRequest.Request) return false;

  // voided async handling
  void approveSender(sender).then(
    status => {
      // user made a choice
      if (status === UserChoice.Approved) respond(PenumbraAccessResponse.Approved);
      else respond(PenumbraAccessResponse.Denied);
    },
    e => {
      if (e instanceof ConnectError && e.code === Code.Unauthenticated)
        respond(PenumbraAccessResponse.NeedsLogin);
      else respond(PenumbraAccessResponse.Denied);

      if (process.env['NODE_ENV'] === 'development')
        console.warn('Penumbra request listener failed:', e);
    },
  );

  // instruct chrome to wait for the response
  return true;
};
