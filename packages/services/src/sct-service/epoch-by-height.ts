import { EpochByHeightResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';
import { Impl } from '.';
import { idbCtx } from '../ctx/prax';

export const epochByHeight: Impl['epochByHeight'] = async (req, ctx) => {
  const { height } = req;

  const idb = await ctx.values.get(idbCtx)();

  const epoch = await idb.getEpochByHeight(height);

  return new EpochByHeightResponse({ epoch });
};
