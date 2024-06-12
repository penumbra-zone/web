import { Impl } from '.';

import { ValidatorState_ValidatorStateEnum } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { dbCtx } from '../ctx/database';

export const validatorInfo: Impl['validatorInfo'] = async function* (req, ctx) {
  const indexedDb = await ctx.values.get(dbCtx)();

  for await (const validatorInfo of indexedDb.iterateValidatorInfos()) {
    if (
      !req.showInactive &&
      validatorInfo.status?.state?.state === ValidatorState_ValidatorStateEnum.INACTIVE
    )
      continue;

    yield { validatorInfo };
  }
};
