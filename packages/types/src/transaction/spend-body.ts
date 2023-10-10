import { z } from 'zod';
import { SpendBody } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { BalanceCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { Base64StringSchema, base64ToUint8Array, InnerBase64Schema } from '../base64';

export const SpendBodySchema = z.object({
  balanceCommitment: InnerBase64Schema,
  nullifier: Base64StringSchema,
  rk: Base64StringSchema,
});

export const spendBodyToProto = (sb: z.infer<typeof SpendBodySchema>): SpendBody => {
  return new SpendBody({
    balanceCommitment: new BalanceCommitment({
      inner: base64ToUint8Array(sb.balanceCommitment.inner),
    }),
    nullifier: base64ToUint8Array(sb.nullifier),
    rk: base64ToUint8Array(sb.rk),
  });
};
