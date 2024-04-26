import type { Impl } from '.';
import { extLocalCtx } from '../ctx/prax';
import { WalletId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { Code, ConnectError } from '@connectrpc/connect';
import { stringToUint8Array } from '@penumbra-zone/types/string';

// TODO: there is never data in this request. should a wallet index be available in context?
export const walletId: Impl['walletId'] = async (_, ctx) => {
  const local = ctx.values.get(extLocalCtx);
  const [wallet] = await local.get('wallets');
  if (!wallet) throw new ConnectError('No wallet', Code.FailedPrecondition);
  const walletId = new WalletId({ inner: stringToUint8Array(wallet.id) });
  return { walletId };
};
