import type { Impl } from '.';
import { approverCtx, extLocalCtx, extSessionCtx, servicesCtx } from '../../ctx';
import { authorizePlan, generateSpendKey } from '@penumbra-zone/wasm';
import { Key } from '@penumbra-zone/crypto-web';
import { bech32AssetId } from '@penumbra-zone/getters';
import { Box, Jsonified } from '@penumbra-zone/types';
import { Code, ConnectError, HandlerContext } from '@connectrpc/connect';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { viewTransactionPlan } from './view-transaction-plan';
import { UserAttitude } from '@penumbra-zone/types/src/user-attitude';

/**
 * @todo As more asset types get used, the amount of asset metadata we store
 * will grow. Loading all the asset metadata into memory for the purpose of
 * compiling a transaction view may not be sustainable in the long term.
 * Eventually, we may want to scan through the transaction plan, extract all the
 * asset IDs in it, and then query just those from IndexedDB instead of grabbing
 * all of them.
 */
const getMetadataByAssetId = async (ctx: HandlerContext) => {
  const services = ctx.values.get(servicesCtx);
  const walletServices = await services.getWalletServices();

  const assetsMetadata: Metadata[] = [];
  for await (const metadata of walletServices.indexedDb.iterateAssetsMetadata()) {
    assetsMetadata.push(metadata);
  }
  return assetsMetadata.reduce<Record<string, Jsonified<Metadata>>>((prev, curr) => {
    if (curr.penumbraAssetId) {
      prev[bech32AssetId(curr.penumbraAssetId)] = curr.toJson() as Jsonified<Metadata>;
    }
    return prev;
  }, {});
};

export const authorize: Impl['authorize'] = async (req, ctx) => {
  if (!req.plan) throw new ConnectError('No plan included in request', Code.InvalidArgument);

  const approveReq = ctx.values.get(approverCtx);
  const sess = ctx.values.get(extSessionCtx);
  const local = ctx.values.get(extLocalCtx);

  if (!approveReq) throw new ConnectError('Approver not found', Code.Unavailable);

  const passwordKey = await sess.get('passwordKey');
  if (!passwordKey) throw new ConnectError('User must login to extension', Code.Unavailable);

  const wallets = await local.get('wallets');
  const {
    custody: { encryptedSeedPhrase },
    fullViewingKey,
  } = wallets[0]!;

  if (!fullViewingKey)
    throw new ConnectError('Unable to get full viewing key', Code.Unauthenticated);

  const key = await Key.fromJson(passwordKey);
  const decryptedSeedPhrase = await key.unseal(Box.fromJson(encryptedSeedPhrase));

  if (!decryptedSeedPhrase)
    throw new ConnectError('Unable to decrypt seed phrase with password', Code.Unauthenticated);

  const denomMetadataByAssetId = await getMetadataByAssetId(ctx);
  const transactionViewFromPlan = viewTransactionPlan(
    req.plan,
    denomMetadataByAssetId,
    fullViewingKey,
  );

  const attitude = await approveReq(req, transactionViewFromPlan);
  if (attitude !== UserAttitude.Approved)
    throw new ConnectError('Transaction was not approved', Code.PermissionDenied);

  const spendKey = generateSpendKey(decryptedSeedPhrase);
  const data = authorizePlan(spendKey, req.plan);

  return { data };
};
