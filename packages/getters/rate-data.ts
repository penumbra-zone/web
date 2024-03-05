import { RateData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { createGetter } from './utils/create-getter';

export const getValidatorRewardRate = createGetter(
  (rateData?: RateData) => rateData?.validatorRewardRate,
);
