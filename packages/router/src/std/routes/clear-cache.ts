import { ServicesInterface, SyncBlocksMessage } from '@penumbra-zone/types';
import { InternalMessageHandler } from '@penumbra-zone/types/src/internal-msg/shared';

export const clearCacheHandler =
  (services: ServicesInterface): InternalMessageHandler<SyncBlocksMessage> =>
  async () => {
    await services.clearCache();
  };
