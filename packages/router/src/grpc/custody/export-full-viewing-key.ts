import type { Impl } from '.';
import { extLocalCtx } from '../../ctx';

import { stringToUint8Array } from '@penumbra-zone/types';

import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';

import { ConnectError, Code } from '@connectrpc/connect';

export const exportFullViewingKey: Impl['exportFullViewingKey'] = async (_, ctx) => {
  const localExtStorage = ctx.values.get(extLocalCtx);
  const wallets = await localExtStorage.get('wallets');
  if (!wallets.length) throw new ConnectError('No wallets in storage', Code.FailedPrecondition);
  const fullViewingKey = new FullViewingKey({
    inner: stringToUint8Array(wallets[0]!.fullViewingKey),
  });
  return { fullViewingKey };
};
