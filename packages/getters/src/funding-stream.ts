import { FundingStream } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { createGetter } from './utils/create-getter.js';

export const getRateBpsFromFundingStream = createGetter(
  (fundingStream?: FundingStream) => fundingStream?.recipient.value?.rateBps,
);
