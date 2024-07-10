import { ValidatorState } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb.js';
import { createGetter } from './utils/create-getter.js';

export const getValidatorStateEnum = createGetter(
  (validatorState?: ValidatorState) => validatorState?.state,
);
