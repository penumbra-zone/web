import {
  AppParametersRequest,
  BalancesResponse,
  StatusRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { HandlerContext } from '@connectrpc/connect';
import { assetPatterns } from '@penumbra-zone/constants/src/assets';
import { getDisplayFromBalancesResponse } from '@penumbra-zone/getters/src/balances-response';
import { status } from '../status';
import { appParameters } from '../app-parameters';

export const isUnbondingTokenBalance = (balancesResponse: PartialMessage<BalancesResponse>) =>
  assetPatterns.unbondingToken.matches(
    getDisplayFromBalancesResponse(new BalancesResponse(balancesResponse)),
  );

export const isClaimable = async (
  balancesResponse: PartialMessage<BalancesResponse>,
  ctx: HandlerContext,
): Promise<boolean> => {
  const [{ fullSyncHeight }, { parameters }] = await Promise.all([
    status(new StatusRequest(), ctx),
    appParameters(new AppParametersRequest(), ctx),
  ]);

  if (!fullSyncHeight || !parameters?.stakeParams?.unbondingDelay) return false;

  const display = getDisplayFromBalancesResponse(new BalancesResponse(balancesResponse));
  const unbondingStartHeight = assetPatterns.unbondingToken.capture(display);

  if (unbondingStartHeight?.startAt) {
    const blocksSinceUnbondingStarted = fullSyncHeight - BigInt(unbondingStartHeight.startAt);
    return blocksSinceUnbondingStarted >= parameters.stakeParams.unbondingDelay;
  }

  return false;
};
