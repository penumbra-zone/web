import { SwMessage, SwMessageHandler } from '../types';
import { ServicesInterface } from 'penumbra-types';

export type SyncBlocksMessage = SwMessage<'SYNC_BLOCKS', undefined, Promise<void>>;

export const syncBlocksHandler =
  (services: ServicesInterface): SwMessageHandler<SyncBlocksMessage> =>
  async () => {
    const ws = await services.getWalletServices();
    await ws.blockProcessor.syncBlocks();
  };
