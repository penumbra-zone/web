import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import {
  getAmount,
  getMetadataFromBalancesResponse,
  getAddressIndex,
} from '@penumbra-zone/getters/balances-response';
import { joinLoHiAmount, multiplyAmountByNumber } from '@penumbra-zone/types/amount';

const groupByAccount = (
  acc: Record<number, BalancesResponse[]>,
  curr: BalancesResponse,
): Record<number, BalancesResponse[]> => {
  const index = getAddressIndex.optional(curr)?.account;

  if (index === undefined) {
    return acc;
  }

  if (acc[index]) {
    acc[index].push(curr);
  } else {
    acc[index] = [curr];
  }

  return acc;
};

const sortByAccountIndex = (a: [string, BalancesResponse[]], b: [string, BalancesResponse[]]) => {
  return Number(a[0]) - Number(b[0]);
};

const sortbyPriorityScore = (a: BalancesResponse, b: BalancesResponse) => {
  const aScore = getMetadataFromBalancesResponse.optional(a)?.priorityScore ?? 1n;
  const bScore = getMetadataFromBalancesResponse.optional(b)?.priorityScore ?? 1n;

  const aAmount = getAmount.optional(a);
  const bAmount = getAmount.optional(b);

  const aPriority = aAmount
    ? joinLoHiAmount(multiplyAmountByNumber(aAmount, Number(aScore)))
    : aScore;
  const bPriority = bAmount
    ? joinLoHiAmount(multiplyAmountByNumber(bAmount, Number(bScore)))
    : bScore;

  return Number(bPriority - aPriority);
};

export const groupAndSort = (balances: BalancesResponse[]): [string, BalancesResponse[]][] => {
  const grouped = balances.reduce(groupByAccount, {});
  return Object.entries(grouped)
    .sort(sortByAccountIndex)
    .map(([index, balances]) => [index, balances.sort(sortbyPriorityScore)]);
};
