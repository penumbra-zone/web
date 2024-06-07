import {
  ValidatorInfoResponse,
  ValidatorState_ValidatorStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { getStateEnumFromValidatorInfo } from '@penumbra-zone/getters/validator-info';
import { Impl } from '.';
import { idbCtx } from '../ctx/prax';

export const validatorInfo: Impl['validatorInfo'] = async function* (req, ctx) {
  const idb = await ctx.values.get(idbCtx)();

  for await (const validatorInfo of idb.iterateValidatorInfos()) {
    if (
      !req.showInactive &&
      getStateEnumFromValidatorInfo(validatorInfo) === ValidatorState_ValidatorStateEnum.INACTIVE
    )
      continue;

    yield new ValidatorInfoResponse({ validatorInfo });
  }
};
