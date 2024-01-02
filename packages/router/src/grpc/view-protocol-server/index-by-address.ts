import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { bech32Address } from '@penumbra-zone/types';
import * as wasm from '@penumbra-zone/wasm-ts';

import { ConnectError, Code } from '@connectrpc/connect';

export const indexByAddress: Impl['indexByAddress'] = async (req, ctx) => {
  if (!req.address) throw new ConnectError('no address given in request', Code.InvalidArgument);
  const services = ctx.values.get(servicesCtx);
  const {
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();

  const address = bech32Address(req.address);

  let addressIndex;
  try {
    addressIndex = wasm.isControlledAddress(fullViewingKey, address);
  } catch (wasmErr) {
    throw new ConnectError('WASM failed to get address index', Code.Internal);
  }

  if (!addressIndex)
    throw new ConnectError(
      'Address is not controlled by view service full viewing key',
      Code.Unauthenticated,
    );

  return { addressIndex };
};
