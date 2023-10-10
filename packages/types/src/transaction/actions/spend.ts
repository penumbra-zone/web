import { z } from 'zod';
import { Base64StringSchema, base64ToUint8Array, InnerBase64Schema } from '../../base64';
import { Action } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import {
  SpendBody,
  ZKSpendProof,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { BalanceCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { SpendAuthSignature } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/decaf377_rdsa/v1alpha1/decaf377_rdsa_pb';

export const SpendSchema = z.object({
  authSig: InnerBase64Schema,
  body: z.object({
    balanceCommitment: InnerBase64Schema,
    nullifier: Base64StringSchema,
    rk: Base64StringSchema,
  }),
  proof: InnerBase64Schema,
});

type Spend = z.infer<typeof SpendSchema>;

export const spendToProto = (spend: Spend): Action =>
  new Action({
    action: {
      case: 'spend',
      value: {
        body: new SpendBody({
          balanceCommitment: new BalanceCommitment({
            inner: base64ToUint8Array(spend.body.balanceCommitment.inner),
          }),
          nullifier: base64ToUint8Array(spend.body.nullifier),
          rk: base64ToUint8Array(spend.body.rk),
        }),
        authSig: new SpendAuthSignature({ inner: base64ToUint8Array(spend.authSig.inner) }),
        proof: new ZKSpendProof({ inner: base64ToUint8Array(spend.proof.inner) }),
      },
    },
  });
