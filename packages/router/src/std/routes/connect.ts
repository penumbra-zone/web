import { localExtStorage } from '@penumbra-zone/storage';
import {
  ConnectMessage,
  NotificationPath,
  ServicesInterface,
  SwMessageHandler,
} from '@penumbra-zone/types';

export const connectHandler =
  (
    services: ServicesInterface,
    sender: chrome.runtime.MessageSender,
  ): SwMessageHandler<ConnectMessage> =>
  async () => {
    const connectedSites = await localExtStorage.get('connectedSites');

    // is sender.origin doesn't exist in connectedSites, notification should be open
    if (!connectedSites.length || !connectedSites.find(origin => origin === sender.origin)) {
      await services.openWindow(NotificationPath.CONNECT_SITE, `?origin=${sender.origin}`);
    }
  };
