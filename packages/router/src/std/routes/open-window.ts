import { OpenWindowMessage, ServicesInterface, SwMessageHandler } from '@penumbra-zone/types';

export const openWindowHandler =
  (services: ServicesInterface): SwMessageHandler<OpenWindowMessage> =>
  async () => {
    await services.openWindow();
  };
