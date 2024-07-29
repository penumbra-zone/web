import { GetValidatorInfoResponse } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';

export const getValidatorInfo = createGetter(
  (validatorInfoResponse?: GetValidatorInfoResponse) => validatorInfoResponse?.validatorInfo,
);
