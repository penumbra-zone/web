import { z } from 'zod';
import { Base64StringSchema, base64ToUint8Array } from '../base64';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';

export const AddressIndexSchema = z.object({
  randomizer: Base64StringSchema,
  account: z.number().optional(),
});

export const addressIndexToProto = (a: z.infer<typeof AddressIndexSchema>): AddressIndex => {
  return new AddressIndex({
    account: a.account ?? 0,
    randomizer: base64ToUint8Array(a.randomizer),
  });
};
