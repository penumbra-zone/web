import { address } from '../schemas/address';
import { isType } from '../validation';
import { z } from 'zod';

export const hasAccountIndex = isType(
  z.object({
    addressView: z.object({
      case: z.literal('decoded'),
      value: z.object({
        index: z.object({
          account: z.number(),
        }),
      }),
    }),
  }),
);

export const hasAddress = isType(
  z.object({
    addressView: z.object({
      case: z.enum(['decoded', 'opaque']),
      value: z.object({ address }),
    }),
  }),
);
