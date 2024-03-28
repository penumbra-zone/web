import type { Impl } from '.';
import { servicesCtx } from '../../ctx/prax';
import { Code, ConnectError } from '@connectrpc/connect';

/**
 * Gas prices are published within the 'CompactBlock' whenever they change. The specific block
 * in which the Gas prices change is unknown and the current Gas prices cannot be retrieved
 * directly from the penumbra full node.
 *
 * The process can be visualized as follows:
 * height:0 - Gas prices are published in a block
 * ...
 * height:288 -
 * height:289 - Gas prices are published in another block.
 * ...
 * height:382 -
 * height:383 - A user needs to create a transaction and needs the gas prices. However, it is
 *       unknown which block contains the current gas prices.
 *
 * To handle this, the last known value of the Gas prices should be cached in IndexedDB
 * as the blocks are scanned. This way, it can be readily accessed when needed.
 */
export const gasPrices: Impl['gasPrices'] = async (_, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();
  const gasPrices = await indexedDb.getGasPrices();
  if (!gasPrices) throw new ConnectError('Gas prices is not available', Code.NotFound);

  return {
    gasPrices,
  };
};
