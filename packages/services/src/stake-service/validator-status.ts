import { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import {
  GetValidatorInfoRequest,
  ValidatorInfo,
} from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { IdentityKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

export const validatorStatus: Impl['validatorStatus'] = async ({ identityKey }, ctx) => {
  const services = await ctx.values.get(servicesCtx)();
  const { querier, indexedDb } = await services.getWalletServices();

  const { status } = new ValidatorInfo(
    // use local info
    (await indexedDb.getValidatorInfo(new IdentityKey(identityKey))) ??
      // or fetch remote info
      (await querier.stake
        .validatorInfo(new GetValidatorInfoRequest({ identityKey }))
        .then(({ validatorInfo }) => validatorInfo)),
  );

  return { status };
};
