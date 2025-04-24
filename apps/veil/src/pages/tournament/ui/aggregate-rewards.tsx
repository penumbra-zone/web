import {
  AssetId,
  ValueView,
  ValueView_KnownAssetId,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  DelegationsByAddressIndexRequest_Filter,
  TournamentVotesResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { penumbra } from '@/shared/const/penumbra';
import { ViewService } from '@penumbra-zone/protobuf/penumbra/view/v1/view_connect';
import { addAmounts, multiplyAmountByNumber } from '@penumbra-zone/types/amount';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { getValueView as getValueViewFromDelegationsByAddressIndexResponse } from '@penumbra-zone/getters/delegations-by-address-index-response';
import { getValidatorInfoFromValueView } from '@penumbra-zone/getters/value-view';
import { ValidatorInfo } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { pnum } from '@penumbra-zone/types/pnum';

export async function aggregateRewardsByEpoch(
  addressIndex?: AddressIndex,
  data?: { votes: TournamentVotesResponse[] },
): Promise<
  {
    epochIndex: bigint;
    total: Amount;
  }[]
> {
  const grouped = new Map<bigint, { amount: Amount; assetId: AssetId }[]>();
  const seen = new Map<bigint, Set<string>>(); // Track unique reward keys per epoch
  const epochTotals: { epochIndex: bigint; total: Amount }[] = [];

  for (const group of data?.votes ?? []) {
    for (const vote of group.votes) {
      const epochIndex = vote.epochIndex;
      const amount = vote.reward?.amount;
      const assetId = vote.reward?.assetId;

      if (!amount || !assetId) continue;

      const rewardKey = `${amount.hi}:${amount.lo}:${Buffer.from(assetId.inner).toString('hex')}`;

      if (!seen.has(epochIndex)) {
        seen.set(epochIndex, new Set());
        grouped.set(epochIndex, []);
      }

      const epochSet = seen.get(epochIndex)!;
      const epochArray = grouped.get(epochIndex)!;

      if (!epochSet.has(rewardKey)) {
        epochSet.add(rewardKey);
        epochArray.push({ amount, assetId });
      }
    }
  }

  const delegationPairs: { delegation: ValueView; validatorInfo: ValidatorInfo }[] = [];

  for await (const response of penumbra.service(ViewService).delegationsByAddressIndex({
    addressIndex,
    filter: DelegationsByAddressIndexRequest_Filter.ALL,
  })) {
    const delegation = getValueViewFromDelegationsByAddressIndexResponse(response);
    const validatorInfo = getValidatorInfoFromValueView(delegation);

    delegationPairs.push({ delegation, validatorInfo });
  }

  for (const [epochIndex, votes] of grouped) {
    let totalAmount = new Amount({ lo: 0n, hi: 0n });

    for (const vote of votes) {
      const assetIdHex = Buffer.from(vote.assetId.inner).toString('hex');

      // Find corresponding delegation
      const matched = delegationPairs.find(pair => {
        const delAssetIdHex = Buffer.from(
          (pair.delegation.valueView.value as ValueView_KnownAssetId).metadata?.penumbraAssetId
            ?.inner ?? [],
        ).toString('hex');

        return delAssetIdHex === assetIdHex;
      });

      if (!matched) {
        console.warn(`No matching delegation for assetId: ${assetIdHex}`);
        continue;
      }

      const amount = vote.amount;
      const rate = matched.validatorInfo.rateData?.validatorExchangeRate;
      const rateVid = pnum(rate, { exponent: 8 }).toNumber();

      if (!rate) {
        console.warn(`No exchange rate for assetId: ${assetIdHex}`);
        continue;
      }

      const converted = multiplyAmountByNumber(amount, rateVid);
      totalAmount = new Amount({
        ...addAmounts(totalAmount, converted),
      });
    }

    epochTotals.push({ epochIndex, total: totalAmount });
  }

  return epochTotals;
}
