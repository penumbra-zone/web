import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  TransactionPlannerRequest,
  TransactionPlannerRequest_UndelegateClaim,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

import {
  getAmount,
  getValidatorIdentityKeyFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/value-view';
import { getBondingState } from '@penumbra-zone/getters/validator-status';
import { penumbra } from '../../penumbra';
import { AppService, SctService, StakeService, ViewService } from '@penumbra-zone/protobuf';
import { assetPatterns } from '@penumbra-zone/types/assets';
import {
  BondingState,
  BondingState_BondingStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';

/**
 * Get the unbonding start height index from the `ValueView` of an unbonding token
 * -- that is, the block height at which unbonding started.
 */
const getUnbondingStartHeight = (unbondingToken: ValueView): bigint => {
  const unbondingMetadata = getMetadata(unbondingToken);

  const unbondingMatch = assetPatterns.unbondingToken.capture(unbondingMetadata.display);
  if (!unbondingMatch?.startAt) {
    throw TypeError('Not an unbonding token', { cause: unbondingMetadata });
  }

  return BigInt(unbondingMatch.startAt);
};

/**
 * Calculate the unbonding end height for a particular token, based on present
 * state of the validator.
 *
 * @see https://github.com/penumbra-zone/penumbra/pull/5084
 */
const getUnbondingEndHeight = ({
  currentHeight,
  appUnbondingDelay,
  startHeight,
  bondingState,
}: {
  currentHeight: bigint;
  appUnbondingDelay: bigint;
  startHeight: bigint;
  bondingState: BondingState;
}) => {
  if (!bondingState.state) {
    throw new ReferenceError('Validator bonding state must be available and specified', {
      cause: bondingState,
    });
  }
  const { state: validatorState, unbondsAtHeight: validatorUnbondingHeight } = bondingState;

  const appDelayHeight = startHeight + appUnbondingDelay;

  let endHeight: bigint;
  switch (validatorState) {
    case BondingState_BondingStateEnum.BONDED:
      endHeight = appDelayHeight;
      break;
    case BondingState_BondingStateEnum.UNBONDING:
      if (validatorUnbondingHeight > startHeight) {
        endHeight =
          // if the validator height exceeds the app delay height
          validatorUnbondingHeight > appDelayHeight
            ? appDelayHeight //  clamp to the app delay height
            : validatorUnbondingHeight;
      } else {
        endHeight = currentHeight;
      }
      break;
    case BondingState_BondingStateEnum.UNBONDED:
      endHeight = currentHeight;
      break;
  }

  return (
    // if the calculated height is in the future
    endHeight > currentHeight
      ? currentHeight // clamp to the current height
      : endHeight
  );
};

const assembleUndelegationClaim = async ({
  currentHeight,
  appUnbondingDelay,
  unbondingToken,
}: {
  currentHeight: bigint;
  appUnbondingDelay: bigint;
  unbondingToken: ValueView;
}): Promise<TransactionPlannerRequest_UndelegateClaim> => {
  const sctClient = penumbra.service(SctService);
  const stakeClient = penumbra.service(StakeService);

  const identityKey = getValidatorIdentityKeyFromValueView(unbondingToken);

  const startHeight = getUnbondingStartHeight(unbondingToken);
  const { epoch: startEpoch } = await sctClient.epochByHeight({ height: startHeight });

  const { status: validatorStatus } = await stakeClient.validatorStatus({ identityKey });

  const endHeight = getUnbondingEndHeight({
    currentHeight,
    appUnbondingDelay,
    startHeight,
    bondingState: getBondingState(validatorStatus),
  });
  const { epoch: endEpoch } = await sctClient.epochByHeight({ height: endHeight });

  const { penalty } = await stakeClient.validatorPenalty({
    identityKey,
    startEpochIndex: startEpoch?.index,
    endEpochIndex: endEpoch?.index,
  });

  return new TransactionPlannerRequest_UndelegateClaim({
    validatorIdentity: identityKey,
    unbondingStartHeight: startHeight,
    unbondingAmount: getAmount(unbondingToken),
    penalty,
  });
};

export const assembleUndelegateClaimRequest = async ({
  account,
  unbondingTokens,
}: {
  account: number;
  unbondingTokens: ValueView[];
}): Promise<TransactionPlannerRequest> => {
  const appClient = penumbra.service(AppService);
  const viewClient = penumbra.service(ViewService);

  const { appParameters } = await appClient.appParameters({});
  if (!appParameters?.stakeParams?.unbondingDelay) {
    throw new ReferenceError('Unbonding delay must be available', {
      cause: appParameters?.stakeParams,
    });
  }
  const { unbondingDelay } = appParameters.stakeParams;

  const { fullSyncHeight } = await viewClient.status({});

  const undelegationClaims = await Promise.all(
    unbondingTokens.map(unbondingToken =>
      assembleUndelegationClaim({
        currentHeight: fullSyncHeight,
        appUnbondingDelay: unbondingDelay,
        unbondingToken,
      }),
    ),
  );

  return new TransactionPlannerRequest({
    undelegationClaims,
    source: { account },
  });
};
