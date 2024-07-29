import { FundingStream } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';

export const getRateBpsFromFundingStream = createGetter(
  (fundingStream?: FundingStream) => fundingStream?.recipient.value?.rateBps,
);
