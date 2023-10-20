import { ServicesInterface, SwMessageHandler, SyncBlocksMessage } from '@penumbra-zone/types';

export const clearCacheHandler =
  (services: ServicesInterface): SwMessageHandler<SyncBlocksMessage> =>
  async () => {
    await services.clearCache();
  };
