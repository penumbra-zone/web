import { createGetter } from './utils/create-getter.js';
import { GetValidatorInfoResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb.js';

export const getValidatorInfo = createGetter(
  (validatorInfoResponse?: GetValidatorInfoResponse) => validatorInfoResponse?.validatorInfo,
);
