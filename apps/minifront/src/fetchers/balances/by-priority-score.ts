import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  getMetadataFromBalancesResponseOptional,
  getAmount,
} from '@penumbra-zone/getters/balances-response';
import { multiplyAmountByNumber, joinLoHiAmount } from '@penumbra-zone/types/amount';

export const sortByPriorityScore = (a: BalancesResponse, b: BalancesResponse) => {
  const aMetadata = getMetadataFromBalancesResponseOptional(a);
  const bMetadata = getMetadataFromBalancesResponseOptional(b);

  const aScore = aMetadata?.priorityScore ?? 1n;
  const bScore = bMetadata?.priorityScore ?? 1n;
  if (aMetadata) aMetadata.priorityScore = BigInt(aScore);
  if (bMetadata) bMetadata.priorityScore = BigInt(bScore);

  const aAmount = getAmount.optional()(a);
  const bAmount = getAmount.optional()(b);

  const aPriority = aAmount
    ? joinLoHiAmount(multiplyAmountByNumber(aAmount, Number(aScore)))
    : aScore;
  const bPriority = bAmount
    ? joinLoHiAmount(multiplyAmountByNumber(bAmount, Number(bScore)))
    : bScore;

  return Number(bPriority - aPriority);
};
