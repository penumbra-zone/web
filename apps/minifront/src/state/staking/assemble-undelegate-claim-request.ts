import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  TransactionPlannerRequest,
  TransactionPlannerRequest_UndelegateClaim,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

import { sctClient, stakeClient, viewClient } from '../../clients';
import {
  getAmount,
  getValidatorIdentityKeyFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/value-view';
import { getUnbondingStartHeight } from '@penumbra-zone/types/assets';

const getUndelegateClaimPlannerRequest =
  (endEpochIndex: bigint) => async (unbondingToken: ValueView) => {
    const unbondingStartHeight = getUnbondingStartHeight(getMetadata(unbondingToken));
    const identityKey = getValidatorIdentityKeyFromValueView(unbondingToken);
    const { epoch: startEpoch } = await sctClient.epochByHeight({ height: unbondingStartHeight });

    const { penalty } = await stakeClient.validatorPenalty({
      startEpochIndex: startEpoch?.index,
      endEpochIndex,
      identityKey,
    });

    return new TransactionPlannerRequest_UndelegateClaim({
      validatorIdentity: identityKey,
      unbondingStartHeight,
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
