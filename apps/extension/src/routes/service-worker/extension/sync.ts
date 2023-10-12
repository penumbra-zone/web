import { SwMessage, SwMessageHandler } from './types';
import { services } from '../../../service-worker';

export type SyncBlocksMessage = SwMessage<'SYNC_BLOCKS', undefined, Promise<void>>;

export const syncBlocksHandler: SwMessageHandler<SyncBlocksMessage> = async () => {
  const ws = await services.getWalletServices();
  await ws.blockProcessor.syncBlocks();
};
