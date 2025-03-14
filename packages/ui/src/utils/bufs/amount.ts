import { AmountSchema } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { create } from '@bufbuild/protobuf';

export const AMOUNT_ZERO = create(AmountSchema, {
  hi: 0n,
  lo: 0n,
});

export const AMOUNT_999 = create(AmountSchema, {
  hi: 0n,
  lo: 999n,
});

export const AMOUNT_123_456_789 = create(AmountSchema, {
  hi: 0n,
  lo: 123_456_789n,
});
