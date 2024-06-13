import type { Impl } from '.';
import { walletIdCtx } from '../ctx/wallet-id';

export const walletId: Impl['walletId'] = async (_, ctx) => {
  const walletId = await ctx.values.get(walletIdCtx)();
  return { walletId };
};
