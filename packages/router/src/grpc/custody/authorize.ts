import type { Impl } from '.';
import { approverCtx, extLocalCtx, extSessionCtx, servicesCtx } from '../../ctx';

import { generateSpendKey, authorizePlan } from '@penumbra-zone/wasm-ts';

import { Key } from '@penumbra-zone/crypto-web';
import { Box, Jsonified, uint8ArrayToBase64 } from '@penumbra-zone/types';

import { ConnectError, Code } from '@connectrpc/connect';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

export const authorize: Impl['authorize'] = async (req, ctx) => {
  if (!req.plan) throw new ConnectError('No plan included in request', Code.InvalidArgument);

  const approveReq = ctx.values.get(approverCtx);
  const sess = ctx.values.get(extSessionCtx);
  const local = ctx.values.get(extLocalCtx);

  const services = ctx.values.get(servicesCtx);
  const walletServices = await services.getWalletServices();
  const assetsMetadata = await walletServices.indexedDb.getAllAssetsMetadata();
  const denomMetadataByAssetId = assetsMetadata.reduce<Record<string, Jsonified<DenomMetadata>>>(
    (prev, curr) => {
      if (curr.penumbraAssetId) {
        prev[uint8ArrayToBase64(curr.penumbraAssetId.inner)] =
          curr.toJson() as Jsonified<DenomMetadata>;
      }
      return prev;
    },
    {},
  );

  const passwordKey = await sess.get('passwordKey');
  if (!passwordKey) throw new ConnectError('User must login to extension', Code.Unavailable);

  const wallets = await local.get('wallets');
  const { encryptedSeedPhrase } = wallets[0]!.custody;

  const key = await Key.fromJson(passwordKey);
  const decryptedSeedPhrase = await key.unseal(Box.fromJson(encryptedSeedPhrase));
  if (!decryptedSeedPhrase)
    throw new ConnectError('Unable to decrypt seed phrase with password', Code.Unauthenticated);

  await approveReq(req, denomMetadataByAssetId);

  const spendKey = generateSpendKey(decryptedSeedPhrase);
  const data = authorizePlan(spendKey, req.plan);

  return { data };
};
