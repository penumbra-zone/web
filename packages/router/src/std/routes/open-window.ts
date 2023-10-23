import { ConnectMessage, ServicesInterface, SwMessageHandler } from '@penumbra-zone/types';

export const connectHandler =
  (services: ServicesInterface): SwMessageHandler<ConnectMessage> =>
  async () => {
    await services.openWindow();
  };
