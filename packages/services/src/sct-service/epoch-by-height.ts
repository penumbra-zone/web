import { Impl } from '.';

import { EpochByHeightResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';
import { dbCtx } from '../ctx/database';

export const epochByHeight: Impl['epochByHeight'] = async (req, ctx) => {
  const { height } = req;

  const indexedDb = await ctx.values.get(dbCtx)();

  const epoch = await indexedDb.getEpochByHeight(height);

  return new EpochByHeightResponse({ epoch });
};
