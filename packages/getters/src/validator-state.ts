import { ValidatorState } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { createGetter } from './utils/create-getter.js';

export const getValidatorStateEnum = createGetter(
  (validatorState?: ValidatorState) => validatorState?.state,
);
