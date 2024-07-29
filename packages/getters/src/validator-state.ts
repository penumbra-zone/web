import { ValidatorState } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';

export const getValidatorStateEnum = createGetter(
  (validatorState?: ValidatorState) => validatorState?.state,
);
