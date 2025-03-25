import {
  AppParametersRequestSchema,
  BalancesResponseSchema,
  StatusRequestSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { create, MessageInitShape } from '@bufbuild/protobuf';
import { HandlerContext } from '@connectrpc/connect';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { getDisplayFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { status } from '../status.js';
import { appParameters } from '../app-parameters.js';

export const isUnbondingTokenBalance = (
  balancesResponse: MessageInitShape<typeof BalancesResponseSchema>,
) => {
  const display = getDisplayFromBalancesResponse.optional(
    create(BalancesResponseSchema, balancesResponse),
  );
  return display ? assetPatterns.unbondingToken.matches(display) : false;
};

/**
 * Given a `BalancesResponse`, resolves to a boolean indicating whether the
 * value in the response is an unbonding token eligible for claiming.
 *
 * @todo This is currently a somewhat naive implementation -- it only takes into
 * account whether the `unbondingDelay` from `AppParameters.stakeParams` has
 * passed. This may mean that some users will have to wait longer than is
 * strictly necessary to claim their unbonding tokens, since claiming of
 * unbonding tokens can happen earlier in certain cases, like if a validator
 * itself becomes unbonded. Once the core team has worked out the logic for
 * earlier unbonding, this should be updated to account for those cases.
 */
export const getIsClaimable = async (
  balancesResponse: MessageInitShape<typeof BalancesResponseSchema>,
  ctx: HandlerContext,
): Promise<boolean> => {
  const [{ fullSyncHeight }, { parameters }] = await Promise.all([
    status(create(StatusRequestSchema), ctx),
    appParameters(create(AppParametersRequestSchema), ctx),
  ]);

  if (!fullSyncHeight || !parameters?.stakeParams?.unbondingDelay) {
    return false;
  }

  const display = getDisplayFromBalancesResponse.optional(
    create(BalancesResponseSchema, balancesResponse),
  );
  if (!display) {
    return false;
  }

  const unbondingStartHeight = assetPatterns.unbondingToken.capture(display);

  if (unbondingStartHeight?.startAt) {
    const blocksSinceUnbondingStarted = fullSyncHeight - BigInt(unbondingStartHeight.startAt);
    return blocksSinceUnbondingStarted >= parameters.stakeParams.unbondingDelay;
  }

  return false;
};
