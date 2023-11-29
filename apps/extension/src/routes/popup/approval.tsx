import { Button } from '@penumbra-zone/ui';
//import { usePopupNav } from '../../utils/navigate';
import { useCallback } from 'react';

import { useStore } from '../../state';
import { useEffect } from 'react';
import {
  approvalSelector,
  //attitudeSelector,
  sendResponseSelector,
} from '../../state/approval';
import { JsonValue } from '@bufbuild/protobuf';

interface PopupApprovalRequest {
  type: 'popup-approval-request';
  pending: JsonValue;
}

interface PopupApprovalResponse {
  type: 'popup-approval-response';
  attitude: boolean;
}

const isPopupApprovalRequest = (request: unknown): request is PopupApprovalRequest =>
  request != null &&
  typeof request === 'object' &&
  'type' in request &&
  request.type === 'popup-approval-request';

export const Approval = () => {
  console.log('THIS IS INSIDE THE POPUP');
  const { setSendResponse, pending, setPending, setAttitude } = useStore(approvalSelector);

  const sendResponse = useStore(sendResponseSelector);

  useEffect(() => {
    const approvalRequestLisetener = (
      request: unknown,
      sender: chrome.runtime.MessageSender,
      sendResponse: (x: unknown) => void,
    ): true => {
      void (async () => {
        console.log('popup message handler got', { request, sender, sendResponse });
        // TODO: validate sender?
        if (isPopupApprovalRequest(request)) {
          const { pending } = request;
          setSendResponse(sendResponse);
          setPending(JSON.stringify(pending));
        }
      })();
      return true;
    };
    chrome.runtime.onMessage.addListener(approvalRequestLisetener);
    return (): void => chrome.runtime.onMessage.removeListener(approvalRequestLisetener);
  }, [setPending, setSendResponse]);

  const respond = useCallback(
    (att: boolean) => {
      setAttitude(att);
      const response: PopupApprovalResponse = { type: 'popup-approval-response', attitude: att };
      console.log('sendResponse', sendResponse);
      if (sendResponse) sendResponse(response);
      // TODO: close popup?
    },
    [setAttitude, sendResponse],
  );

  return (
    <div className='flex h-screen flex-col justify-between p-[30px] pt-10 '>
      <h2>Authorize Request</h2>
      <div className='flex flex-row gap-4'>
        <Button
          size='lg'
          variant='gradient'
          onClick={() => {
            debugger;
            respond(true);
          }}
        >
          Permit
        </Button>
        <Button
          size='lg'
          variant='gradient'
          onClick={() => {
            debugger;
            respond(false);
          }}
        >
          Deny
        </Button>
      </div>
      <div>{JSON.stringify(pending)}</div>
    </div>
  );
};
