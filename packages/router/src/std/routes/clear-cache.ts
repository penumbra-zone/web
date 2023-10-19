import { ServicesInterface, SwMessageHandler, SyncBlocksMessage } from 'penumbra-types';

export const clearCacheHandler =
  (services: ServicesInterface): SwMessageHandler<SyncBlocksMessage> =>
  async () => {
    await services.clearCache();
  };
