import { Button } from '@penumbra-zone/ui';
import { useStore } from '../../../state';
import { messagesSelector } from '../../../state/messages';
import { Message, MessageStatus } from '@penumbra-zone/types';
import { connectedSitesSelector } from '../../../state/connected-sites';
import { services } from '../../../service-worker';

interface ConnectProps {
  message: Message;
}
export const Connect = ({ message }: ConnectProps) => {
  const { changeStatusMessage } = useStore(messagesSelector);
  const { addOrigin } = useStore(connectedSitesSelector);

  return (
    <div className='flex min-h-screen w-full flex-col justify-between p-[30px]'>
      <div className='flex flex-col items-center gap-4'>
        <div className='h-20 w-[150px]'>
          <img src='/logo.svg' alt='logo' />
        </div>
        <p className='font-headline text-xl font-semibold leading-[30px]'>Requesting Connection</p>
        <p className='font-headline text-base font-semibold text-muted-foreground'>
          {message.origin}
        </p>
      </div>
      <div className='flex gap-5'>
        <Button
          variant='secondary'
          className='w-[50%]'
          size='lg'
          onClick={() =>
            void (async () => {
              await changeStatusMessage(message.id, MessageStatus.REJECTED);
              await services.updateBadge();
              window.close();
            })()
          }
        >
          Reject
        </Button>
        <Button
          variant='gradient'
          className='w-[50%]'
          size='lg'
          onClick={() =>
            void (async () => {
              await changeStatusMessage(message.id, MessageStatus.APPROVED);
              await addOrigin(message.origin);
              await services.updateBadge();
              window.close();
            })()
          }
        >
          Approve
        </Button>
      </div>
    </div>
  );
};
