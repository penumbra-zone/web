import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import * as wasm from '@penumbra-zone/wasm-ts';

import { ConnectError, Code } from '@connectrpc/connect';

export const addressByIndex: Impl['addressByIndex'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const {
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();

  let address;
  try {
    address = wasm.getAddressByIndex(fullViewingKey, req.addressIndex?.account ?? 0);
  } catch (wasmErr) {
    throw new ConnectError('WASM failed to get address by index', Code.Internal);
  }

  return { address };
};
