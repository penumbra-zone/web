import { Impl } from '.';
import { servicesCtx } from '../ctx/prax';
import {
  ValidatorInfoResponse,
  ValidatorState_ValidatorStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { getStateEnumFromValidatorInfo } from '@penumbra-zone/getters/src/validator-info';

export const validatorInfo: Impl['validatorInfo'] = async function* (req, ctx) {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();

  for await (const validatorInfo of indexedDb.iterateValidatorInfos()) {
    if (
      !req.showInactive &&
      getStateEnumFromValidatorInfo(validatorInfo) === ValidatorState_ValidatorStateEnum.INACTIVE
    )
      continue;

    yield new ValidatorInfoResponse({ validatorInfo });
  }
};
