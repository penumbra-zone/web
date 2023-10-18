import { services } from '../../../service-worker';
import { SwMessage, SwMessageHandler } from './types';

export type ClearCacheMessage = SwMessage<'CLEAR_CACHE', undefined, Promise<void>>;

export const clearCacheHandler: SwMessageHandler<ClearCacheMessage> = async () => {
  await services.clearCache();
};
