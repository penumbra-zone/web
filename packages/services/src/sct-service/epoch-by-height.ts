import { EpochByHeightResponseSchema } from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import { create } from '@bufbuild/protobuf';
import { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';

export const epochByHeight: Impl['epochByHeight'] = async (req, ctx) => {
  const { height } = req;

  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  const epoch = await indexedDb.getEpochByHeight(height);

  return create(EpochByHeightResponseSchema, { epoch });
};
