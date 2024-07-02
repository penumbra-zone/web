import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  getMetadataFromBalancesResponseOptional,
  getAmount,
} from '@penumbra-zone/getters/balances-response';
import { getAssetPriorityScore } from './asset-priority-score';
import { multiplyAmountByNumber, joinLoHiAmount } from '@penumbra-zone/types/amount';

export const sortByPriorityScore =
  (assetIds: Set<string>) => (a: BalancesResponse, b: BalancesResponse) => {
    const aMetadata = getMetadataFromBalancesResponseOptional(a);
    const bMetadata = getMetadataFromBalancesResponseOptional(b);

    const aScore = getAssetPriorityScore(aMetadata, assetIds);
    const bScore = getAssetPriorityScore(bMetadata, assetIds);
    if (aMetadata) aMetadata.priorityScore = BigInt(aScore);
    if (bMetadata) bMetadata.priorityScore = BigInt(bScore);

    const aAmount = getAmount.optional()(a);
    const bAmount = getAmount.optional()(b);

    const aPriority = aAmount
      ? joinLoHiAmount(multiplyAmountByNumber(aAmount, aScore))
      : BigInt(aScore);
    const bPriority = bAmount
      ? joinLoHiAmount(multiplyAmountByNumber(bAmount, bScore))
      : BigInt(bScore);

    return Number(bPriority - aPriority);
  };
