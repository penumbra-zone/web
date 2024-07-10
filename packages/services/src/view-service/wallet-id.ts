import type { Impl } from './index.js';
import { walletIdCtx } from '../ctx/wallet-id.js';

export const walletId: Impl['walletId'] = async (_, ctx) => {
  const walletId = await ctx.values.get(walletIdCtx)();
  return { walletId };
};
