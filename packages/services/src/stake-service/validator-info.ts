import { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import {
  ValidatorInfoResponse,
  ValidatorState_ValidatorStateEnum,
} from '@penumbra-zone/protobuf/types';
import { getStateEnumFromValidatorInfo } from '@penumbra-zone/getters/validator-info';

export const validatorInfo: Impl['validatorInfo'] = async function* (req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  for await (const validatorInfo of indexedDb.iterateValidatorInfos()) {
    if (
      !req.showInactive &&
      getStateEnumFromValidatorInfo(validatorInfo) === ValidatorState_ValidatorStateEnum.INACTIVE
    ) {
      continue;
    }

    yield new ValidatorInfoResponse({ validatorInfo });
  }
};
