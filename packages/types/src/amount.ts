import { z } from 'zod';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';

export const AmountSchema = z.object({
  lo: z.string(),
  hi: z.string().optional(),
});

export const amountToProto = (a: z.infer<typeof AmountSchema>): Amount => {
  return new Amount({
    lo: BigInt(a.lo),
    hi: a.hi ? BigInt(a.hi) : 0n,
  });
};
