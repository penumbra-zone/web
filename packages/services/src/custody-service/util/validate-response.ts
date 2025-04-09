import { PlainMessage, toPlainMessage } from '@bufbuild/protobuf';
import {
  ActionPlan,
  AuthorizationData,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { isZeroBytes } from './zero-bytes.js';

const validateEffectHash = (
  field: keyof PlainMessage<AuthorizationData>,
  data: PlainMessage<AuthorizationData>,
) => {
  if (field !== 'effectHash') {
    throw new Error('Wrong validation');
  }
  const effectHash = data[field as 'effectHash'];

  if (!effectHash || isZeroBytes(effectHash.inner)) {
    throw new TypeError('Zero effect');
  } else if (effectHash.inner.length !== 64) {
    throw new TypeError('Invalid effect hash');
  }
};

const validateSpendAuths =
  (actionType: 'spend' | 'delegatorVote' | 'actionLiquidityTournamentVote') =>
  (
    field: keyof PlainMessage<AuthorizationData>,
    data: PlainMessage<AuthorizationData>,
    counts: Record<typeof actionType, number>,
  ) => {
    if (!['spendAuths', 'delegatorVoteAuths', 'lqtVoteAuths'].includes(field)) {
      throw new Error('Wrong validation');
    }

    const auths = data[field as 'spendAuths' | 'delegatorVoteAuths' | 'lqtVoteAuths'];
    const count = counts[actionType];

    if (count < auths.length) {
      throw new Error(`Unexpected ${actionType} authorization`);
    } else if (count > auths.length || auths.some(s => isZeroBytes(s.inner))) {
      throw new ReferenceError(`Missing ${actionType} authorization`);
    } else if (auths.some(s => s.inner.length !== 64)) {
      throw new TypeError(`Invalid ${actionType} authorization`);
    }
  };

const authValidations = {
  effectHash: validateEffectHash,
  spendAuths: validateSpendAuths('spend'),
  delegatorVoteAuths: validateSpendAuths('delegatorVote'),
  lqtVoteAuths: validateSpendAuths('actionLiquidityTournamentVote'),
} as const;

export const assertValidAuthorizationData = (
  actionCounts: Record<NonNullable<ActionPlan['action']['case']>, number>,
  data: PlainMessage<AuthorizationData> = toPlainMessage(new AuthorizationData({})),
): PlainMessage<AuthorizationData> => {
  for (const field of Object.keys(authValidations) as (keyof PlainMessage<AuthorizationData>)[]) {
    authValidations[field](field, data, actionCounts);
  }
  return data;
};
