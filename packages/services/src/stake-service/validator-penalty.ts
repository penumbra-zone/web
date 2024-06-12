import { createPromiseClient } from '@connectrpc/connect';
import { Impl } from '.';
import { fullnodeCtx } from '../ctx/fullnode';
import { StakeService } from '@penumbra-zone/protobuf';

export const validatorPenalty: Impl['validatorPenalty'] = async (req, ctx) => {
  const stakeClient = createPromiseClient(StakeService, await ctx.values.get(fullnodeCtx)());
  return stakeClient.validatorPenalty(req);
};
