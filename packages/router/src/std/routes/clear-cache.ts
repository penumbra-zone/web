import { SwMessage, SwMessageHandler } from '../types';
import { ServicesInterface } from 'penumbra-types';
import { SyncBlocksMessage } from './sync';

export type ClearCacheMessage = SwMessage<'CLEAR_CACHE', undefined, Promise<void>>;

export const clearCacheHandler =
  (services: ServicesInterface): SwMessageHandler<SyncBlocksMessage> =>
  async () => {
    await services.clearCache();
  };
