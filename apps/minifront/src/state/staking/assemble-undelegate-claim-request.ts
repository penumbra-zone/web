import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  TransactionPlannerRequest,
  TransactionPlannerRequest_UndelegateClaim,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

import { sctClient, stakeClient, viewClient } from '../../clients';
import {
  getAmount,
  getStartEpochIndexFromValueView,
  getValidatorIdentityKeyAsBech32StringFromValueView,
} from '@penumbra-zone/getters/src/value-view';
import { asIdentityKey } from '@penumbra-zone/getters/src/string';

const getUndelegateClaimPlannerRequest =
  (endEpochIndex: bigint) => async (unbondingToken: ValueView) => {
    const startEpochIndex = getStartEpochIndexFromValueView(unbondingToken);
    const validatorIdentityKeyAsBech32String =
      getValidatorIdentityKeyAsBech32StringFromValueView(unbondingToken);
    const identityKey = asIdentityKey(validatorIdentityKeyAsBech32String);

    const { penalty } = await stakeClient.validatorPenalty({
      startEpochIndex,
      endEpochIndex,
      identityKey,
    });

    return new TransactionPlannerRequest_UndelegateClaim({
      validatorIdentity: identityKey,
      startEpochIndex,
      penalty,
      unbondingAmount: getAmount(unbondingToken),
    });
  };

export const assembleUndelegateClaimRequest = async ({
  account,
  unbondingTokens,
}: {
  account: number;
  unbondingTokens: ValueView[];
}) => {
  const { fullSyncHeight } = await viewClient.status({});
  const { epoch } = await sctClient.epochByHeight({ height: fullSyncHeight });
  const endEpochIndex = epoch?.index;
  if (!endEpochIndex) return;

  return new TransactionPlannerRequest({
    undelegationClaims: await Promise.all(
      unbondingTokens.map(getUndelegateClaimPlannerRequest(endEpochIndex)),
    ),
    source: { account },
  });
};
