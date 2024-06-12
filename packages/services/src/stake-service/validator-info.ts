import { Impl } from '.';

import {
  ValidatorInfoResponse,
  ValidatorState_ValidatorStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { getStateEnumFromValidatorInfo } from '@penumbra-zone/getters/validator-info';
import { dbCtx } from '../ctx/database';

export const validatorInfo: Impl['validatorInfo'] = async function* (req, ctx) {
  const indexedDb = await ctx.values.get(dbCtx)();

  for await (const validatorInfo of indexedDb.iterateValidatorInfos()) {
    if (
      !req.showInactive &&
      getStateEnumFromValidatorInfo(validatorInfo) === ValidatorState_ValidatorStateEnum.INACTIVE
    )
      continue;

    yield new ValidatorInfoResponse({ validatorInfo });
  }
};
