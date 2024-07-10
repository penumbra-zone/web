import {
  AuthorizationData,
  TransactionPlan,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { HandlerContext, ConnectError, Code } from '@connectrpc/connect';
import { custodyClientCtx } from '../../ctx/custody-client';

export const custodyAuthorize = async (
  ctx: HandlerContext,
  plan: TransactionPlan,
): Promise<AuthorizationData> => {
  const custodyClient = ctx.values.get(custodyClientCtx);
  if (!custodyClient) {
    throw new ConnectError('Cannot access custody service', Code.FailedPrecondition);
  }
  const { data } = await custodyClient.authorize({ plan });
  if (!data) {
    throw new ConnectError('No authorization data', Code.PermissionDenied);
  }
  return data;
};
