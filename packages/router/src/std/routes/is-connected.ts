import { localExtStorage, sessionExtStorage } from '@penumbra-zone/storage';
import { IsConnectedMessage, SwMessageHandler } from '@penumbra-zone/types';

export const isConnectedHandler =
  (sender: chrome.runtime.MessageSender): SwMessageHandler<IsConnectedMessage> =>
  async () => {
    const connectedSites = await localExtStorage.get('connectedSites');
    const isPassword = await sessionExtStorage.get('passwordKey');

    return connectedSites.includes(sender.origin!) && Boolean(isPassword);
  };
