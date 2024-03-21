import { EpochByHeightResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';
import { Impl } from '.';
import { servicesCtx } from '../../ctx/prax';

export const epochByHeight: Impl['epochByHeight'] = async (req, ctx) => {
  const { height } = req;

  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();

  const epoch = await indexedDb.getEpochByHeight(height);

  return new EpochByHeightResponse({ epoch });
};
