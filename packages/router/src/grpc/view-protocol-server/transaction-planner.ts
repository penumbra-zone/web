import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { getAddressByIndex, planTransaction } from '@penumbra-zone/wasm';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { Code, ConnectError } from '@connectrpc/connect';

export const transactionPlanner: Impl['transactionPlanner'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const {
    indexedDb,
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();
  const fmdParams = await indexedDb.getFmdParams();
  if (!fmdParams) throw new ConnectError('FmdParameters not available', Code.FailedPrecondition);
  const { chainId, sctParams } = (await indexedDb.getAppParams()) ?? {};
  if (!sctParams) throw new ConnectError('SctParameters not available', Code.FailedPrecondition);
  if (!chainId) throw new ConnectError('ChainId not available', Code.FailedPrecondition);
  const gasPrices = await indexedDb.getGasPrices();
  if (!gasPrices) throw new ConnectError('Gas prices is not available', Code.FailedPrecondition);

  // If there are any balances left over, refund back to source. Default to account 0.
  const source = req.source ?? new AddressIndex({ account: 0 });
  const refundAddr = getAddressByIndex(fullViewingKey, source.account);

  const idbConstants = indexedDb.constants();

  const plan = await planTransaction(idbConstants, req, refundAddr, fmdParams, sctParams, gasPrices, chainId);
  return { plan };
};
