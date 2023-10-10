import { z } from 'zod';
import { Action } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { OutputSchema, outputToProto } from '../output';

export const outputActionToProto = (o: z.infer<typeof OutputSchema>): Action =>
  new Action({
    action: {
      case: 'output',
      value: outputToProto(o),
    },
  });
