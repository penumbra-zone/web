import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import {
  getMetadataFromBalancesResponseOptional,
  getAmount,
  getAddressIndex,
} from '@penumbra-zone/getters/balances-response';
import { multiplyAmountByNumber, joinLoHiAmount } from '@penumbra-zone/types/amount';

export const sortByPriorityScore = (a: BalancesResponse, b: BalancesResponse) => {
  const aScore = getMetadataFromBalancesResponseOptional(a)?.priorityScore ?? 1n;
  const bScore = getMetadataFromBalancesResponseOptional(b)?.priorityScore ?? 1n;

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

export const sortByPriorityScoreAndAccountIndex = (a: BalancesResponse, b: BalancesResponse) => {
  const aIndex = getAddressIndex.optional()(a)?.account ?? Infinity;
  const bIndex = getAddressIndex.optional()(b)?.account ?? Infinity;

  if (aIndex === bIndex) {
    return sortByPriorityScore(a, b);
  }

  return aIndex - bIndex;
};
