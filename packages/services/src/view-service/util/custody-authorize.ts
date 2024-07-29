import { AuthorizationData, TransactionPlan } from '@penumbra-zone/protobuf/types';
import { HandlerContext, ConnectError, Code } from '@connectrpc/connect';
import { custodyClientCtx } from '../../ctx/custody-client.js';

export const custodyAuthorize = async (
  ctx: HandlerContext,
  plan: TransactionPlan,
): Promise<AuthorizationData> => {
  const custodyClient = ctx.values.get(custodyClientCtx);
  if (!custodyClient) {
    throw new ConnectError('Cannot access custody service', Code.FailedPrecondition);
  }
  // authorization awaits user interaction, so timeout is disabled
  const { data } = await custodyClient.authorize({ plan }, { timeoutMs: 0 });
  if (!data) {
    throw new ConnectError('No authorization data', Code.PermissionDenied);
  }
  return data;
};
