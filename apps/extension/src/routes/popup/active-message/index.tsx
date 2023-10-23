import { redirect } from 'react-router-dom';
import { Message, MessageStatus, MessageType } from '@penumbra-zone/types';
import { PopupPath } from '../paths';
import { localExtStorage } from '@penumbra-zone/storage';
import { Connect } from './connect';
import { useStore } from '../../../state';
import { messagesSelector } from '../../../state/messages';

export interface PopupActiveMessageData {
  message: Message;
}

export const popupActiveMessageLoader = async () => {
  const messages = await localExtStorage.get('messages');

  const lastPendingMessage = messages.find(msg => msg.status === MessageStatus.PENDING);

  if (!lastPendingMessage) return redirect(PopupPath.INDEX);

  return null;
};

export const ActiveMessage = () => {
  const { messages } = useStore(messagesSelector);
  const inPendingMessage = messages.find(msg => msg.status === MessageStatus.PENDING);

  if (!inPendingMessage) return <></>;

  return (
    <>{inPendingMessage.type === MessageType.CONNECT && <Connect message={inPendingMessage} />}</>
  );
};
