import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  TransactionPlannerRequest,
  TransactionPlannerRequest_UndelegateClaim,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

import {
  getAmount,
  getValidatorIdentityKeyFromValueView,
  getDisplayDenomFromView,
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
 * Find the unbonding start height, for penalty calculation.
 *
 * Parses the value's denom for its embedded unbonding start height.
 */
const parseUnbondingStartHeight = (unbondingValue: ValueView): bigint => {
  const unbondingMatch = assetPatterns.unbondingToken.capture(
    getDisplayDenomFromView(unbondingValue),
  );
  if (!unbondingMatch?.startAt) {
    throw TypeError('Value is not an unbonding token', { cause: unbondingValue });
  }

  return BigInt(unbondingMatch.startAt);
};

/**
 * Find a reasonable unbonding end height, for penalty calculation.
 *
 * The unbonding may be old enough that the validator has since transitioned
 * states, so the chosen end height depends on the validator's present state.
 *
 * @see https://github.com/penumbra-zone/penumbra/pull/5084
 */
const chooseUnbondingEndHeight = ({
  currentHeight,
  appUnbondingDelay,
  startHeight,
  validatorBondingState,
}: {
  currentHeight: bigint;
  appUnbondingDelay: bigint;
  startHeight: bigint;
  validatorBondingState: BondingState;
}) => {
  if (!validatorBondingState.state) {
    throw new ReferenceError('Validator bonding state must be available', {
      cause: validatorBondingState,
    });
  }
  const { state: validatorState, unbondsAtHeight: validatorHeight } = validatorBondingState;

  const appDelayHeight = startHeight + appUnbondingDelay;

  let endHeight: bigint;
  switch (validatorState) {
    case BondingState_BondingStateEnum.BONDED:
      endHeight = appDelayHeight;
      break;
    case BondingState_BondingStateEnum.UNBONDING:
      if (validatorHeight > startHeight) {
        endHeight =
          // if the validator height exceeds the app delay height
          validatorHeight > appDelayHeight
            ? appDelayHeight //  clamp to the app delay height
            : validatorHeight;
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
  unbondingValue,
}: {
  currentHeight: bigint;
  appUnbondingDelay: bigint;
  unbondingValue: ValueView;
}): Promise<TransactionPlannerRequest_UndelegateClaim> => {
  const sctClient = penumbra.service(SctService);
  const stakeClient = penumbra.service(StakeService);

  const identityKey = getValidatorIdentityKeyFromValueView(unbondingValue);

  const { status: validatorStatus } = await stakeClient.validatorStatus({ identityKey });

  const startHeight = parseUnbondingStartHeight(unbondingValue);
  const { epoch: startEpoch } = await sctClient.epochByHeight({ height: startHeight });

  const endHeight = chooseUnbondingEndHeight({
    currentHeight,
    appUnbondingDelay,
    startHeight,
    validatorBondingState: getBondingState(validatorStatus),
  });
  const { epoch: endEpoch } = await sctClient.epochByHeight({ height: endHeight });

  if (!startEpoch || !endEpoch) {
    throw new Error('Failed to identify an unbonding epoch range', {
      cause: { startHeight, endHeight },
    });
  }

  const { penalty } = await stakeClient.validatorPenalty({
    identityKey,
    startEpochIndex: startEpoch.index,
    endEpochIndex: endEpoch.index,
  });

  if (!penalty) {
    throw new Error('No penalty for unbonding from validator', {
      cause: {
        unbondingValue,
        startEpoch,
        endEpoch,
        validatorIdentity: identityKey,
        validatorStatus,
      },
    });
  }

  return new TransactionPlannerRequest_UndelegateClaim({
    validatorIdentity: identityKey,
    unbondingStartHeight: startHeight,
    unbondingAmount: getAmount(unbondingValue),
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
    unbondingTokens.map(unbondingValue =>
      assembleUndelegationClaim({
        currentHeight: fullSyncHeight,
        appUnbondingDelay: unbondingDelay,
        unbondingValue,
      }),
    ),
  );

  return new TransactionPlannerRequest({
    undelegationClaims,
    source: { account },
  });
};
