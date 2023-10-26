import { localExtStorage } from '@penumbra-zone/storage';
import { IsConnectedMessage, SwMessageHandler } from '@penumbra-zone/types';

export const isConnectedHandler =
  (sender: chrome.runtime.MessageSender): SwMessageHandler<IsConnectedMessage> =>
  async () => {
    const connectedSites = await localExtStorage.get('connectedSites');

    return connectedSites.includes(sender.origin!);
  };
