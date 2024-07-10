import { FundingStream } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb.js';
import { createGetter } from './utils/create-getter.js';

export const getRateBpsFromFundingStream = createGetter(
  (fundingStream?: FundingStream) => fundingStream?.recipient.value?.rateBps,
);
