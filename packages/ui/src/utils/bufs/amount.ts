import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';

export const AMOUNT_ZERO = new Amount({
  hi: 0n,
  lo: 0n,
});

export const AMOUNT_999 = new Amount({
  hi: 0n,
  lo: 999n,
});

export const AMOUNT_123_456_789 = new Amount({
  hi: 0n,
  lo: 123_456_789n,
});
