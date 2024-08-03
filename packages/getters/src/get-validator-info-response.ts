import { createGetter } from './utils/create-getter.js';
import { GetValidatorInfoResponse } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';

export const getValidatorInfo = createGetter(
  (validatorInfoResponse?: GetValidatorInfoResponse) => validatorInfoResponse?.validatorInfo,
);
