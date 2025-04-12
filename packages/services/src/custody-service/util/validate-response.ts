import { AuthorizationData } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { EffectHash } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import { SpendAuthSignature } from '@penumbra-zone/protobuf/penumbra/crypto/decaf377_rdsa/v1/decaf377_rdsa_pb';

const isEmptyBytes = (i?: Uint8Array): boolean => !i?.length || i.every(v => !v);
const isEmptySignature = (sigs?: SpendAuthSignature[]) =>
  !sigs?.length || sigs.some(s => isEmptyBytes(s.inner));

export const assertNonzeroEffect = (effectHash?: EffectHash) => {
  if (isEmptyBytes(effectHash?.inner)) {
    throw new Error('Zero effect');
  }
};

export const assertNonzeroSignature = (data?: AuthorizationData) => {
  const { delegatorVoteAuths = [], spendAuths = [], lqtVoteAuths = [] } = data ?? {};
  if (isEmptySignature([...delegatorVoteAuths, ...spendAuths, ...lqtVoteAuths])) {
    throw new Error('Zero signature');
  }
};
