import { ClearCacheMessage, ServicesInterface } from '@penumbra-zone/types';
import { InternalMessageHandler } from '@penumbra-zone/types/src/internal-msg/shared';

export const clearCacheHandler =
  (services: ServicesInterface): InternalMessageHandler<ClearCacheMessage> =>
  async () => {
    await services.clearCache();
  };
