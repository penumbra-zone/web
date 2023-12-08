import { ServicesInterface, SyncBlocksMessage } from '@penumbra-zone/types';
import { InternalMessageHandler } from '@penumbra-zone/types/src/internal-msg/shared';

export const syncBlocksHandler =
  (services: ServicesInterface): InternalMessageHandler<SyncBlocksMessage> =>
  async () => {
    const ws = await services.getWalletServices();
    await ws.blockProcessor.syncBlocks();
  };
