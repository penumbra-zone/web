import { z } from 'zod';
import { base64ToUint8Array, InnerBase64Schema } from '../../base64';
import { Action } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { ZKSpendProof } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { SpendAuthSignature } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/decaf377_rdsa/v1alpha1/decaf377_rdsa_pb';
import { SpendBodySchema, spendBodyToProto } from '../spend-body';

export const SpendSchema = z.object({
  authSig: InnerBase64Schema,
  body: SpendBodySchema,
  proof: InnerBase64Schema,
});

type Spend = z.infer<typeof SpendSchema>;

export const spendActionToProto = (spend: Spend): Action =>
  new Action({
    action: {
      case: 'spend',
      value: {
        body: spendBodyToProto(spend.body),
        authSig: new SpendAuthSignature({ inner: base64ToUint8Array(spend.authSig.inner) }),
        proof: new ZKSpendProof({ inner: base64ToUint8Array(spend.proof.inner) }),
      },
    },
  });
