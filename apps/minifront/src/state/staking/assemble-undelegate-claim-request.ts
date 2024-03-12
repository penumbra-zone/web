import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  TransactionPlannerRequest_UndelegateClaim,
  TransactionPlannerRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  getStartEpochIndexFromValueView,
  getValidatorIdentityKeyAsBech32StringFromValueView,
  asIdentityKey,
  getAmount,
} from '@penumbra-zone/getters';
import { stakeClient, viewClient, sctClient } from '../../clients';

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
