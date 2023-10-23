import { Button } from '@penumbra-zone/ui';
import { useStore } from '../../../state';
import { messagesSelector } from '../../../state/messages';
import { Message, MessageStatus } from '@penumbra-zone/types';
import { connectedSitesSelector } from '../../../state/connected-sites';

interface ConnectProps {
  message: Message;
}
export const Connect = ({ message }: ConnectProps) => {
  const { changeStatusMessage } = useStore(messagesSelector);
  const { addOrigin } = useStore(connectedSitesSelector);

  return (
    <div>
      <p>{message.origin}</p>
      <Button
        onClick={() =>
          void (async () => {
            await changeStatusMessage(message.id, MessageStatus.APPROVED);
            await addOrigin(message.origin);
            window.close();
          })()
        }
      >
        Approve {message.id}
      </Button>
      <Button
        onClick={() =>
          void (async () => {
            await changeStatusMessage(message.id, MessageStatus.REJECTED);
            window.close();
          })()
        }
      >
        Reject {message.id}
      </Button>
    </div>
  );
};
