import type { Impl } from '.';
import { extLocalCtx } from '../../ctx';

import { stringToUint8Array } from '@penumbra-zone/types';

import { WalletId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';

// TODO: there is no index or other data in this request. should a wallet index be available in context?

export const walletId: Impl['walletId'] = async (_, ctx) => {
  const local = ctx.values.get(extLocalCtx);
  const [wallet] = await local.get('wallets');
  if (!wallet) throw new Error('No wallet');
  const walletId = new WalletId({ inner: stringToUint8Array(wallet.id) });
  return { walletId };
};
