import { localExtStorage } from '@penumbra-zone/storage';
import {
  ConnectMessage,
  MessageStatus,
  MessageType,
  ServicesInterface,
  SwMessageHandler,
} from '@penumbra-zone/types';
import generateUniqueId from 'generate-unique-id';

export const connectHandler =
  (
    services: ServicesInterface,
    sender: chrome.runtime.MessageSender,
  ): SwMessageHandler<ConnectMessage> =>
  async () => {
    const connectedSites = await localExtStorage.get('connectedSites');
    const messages = await localExtStorage.get('messages');

    // check is pending message exist with same origin
    if (messages.find(msg => msg.status === MessageStatus.PENDING && msg.origin === sender.origin))
      return;

    // create message when connectedSites doesn`t include orrigin
    if (!connectedSites.length || !connectedSites.find(origin => origin === sender.origin)) {
      // check is origin is not approved early
      await localExtStorage.set('messages', [
        {
          status: MessageStatus.PENDING,
          origin: sender.origin!,
          type: MessageType.CONNECT,
          id: generateUniqueId(),
        },
        ...messages,
      ]);
      await services.updateBadge();
    }

    await services.openWindow();
  };
